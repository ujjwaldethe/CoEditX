import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Phone, PhoneOff, VolumeX, Volume2 } from "lucide-react";

export default function VoiceCall({ theme, roomId, isHost = false }) {
  const userEmail = localStorage.getItem("code-editor-user-email");
  const userId = useRef(`user_${Math.random().toString(36).substring(2, 9)}`).current;
  const isDark = theme === "vs-dark" || theme === "hc-black";
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [mutedByHost, setMutedByHost] = useState(false);
  const audioContextRef = useRef(null);
  const audioDestinationRef = useRef(null);
  const audioSourcesRef = useRef({});

  const colors = {
    // Main backgrounds
    background: isDark ? "bg-[#1e1e1e]" : "bg-white",
    headerBg: isDark ? "bg-[#252526]" : "bg-gray-100",
    callControlBg: isDark ? "bg-[#3c3c3c]" : "bg-gray-100",

    // Text colors
    headerText: isDark ? "text-gray-200" : "text-gray-800",
    mutedText: isDark ? "text-gray-400" : "text-gray-500",
    
    // Buttons
    buttonActiveBg: isDark ? "bg-pink-600" : "bg-pink-500",
    buttonHover: isDark ? "hover:bg-pink-700" : "hover:bg-pink-600",
    buttonInactiveBg: isDark ? "bg-gray-700" : "bg-gray-300",
    
    // Indicator colors
    activeIndicator: "bg-green-500",
    inactiveIndicator: "bg-red-500",
    
    // Borders
    border: isDark ? "border-gray-800" : "border-gray-200",
  };

  // Connect to WebSocket when component mounts
  useEffect(() => {
    if (!roomId || !userEmail) return;
    
    // Get the existing WebSocket connection from parent
    if (window.existingSocket && window.existingSocket.readyState === WebSocket.OPEN) {
      socketRef.current = window.existingSocket;
      console.log("Reusing existing WebSocket connection");
    } else {
      const socket = new WebSocket(`ws://localhost:8000/ws/${roomId}`);
      socketRef.current = socket;
      window.existingSocket = socket;
      
      socket.onopen = () => {
        console.log("Voice call connected to WebSocket");
      };
      
      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    }
    
    // Set up message handler for voice call related messages
    const handleSocketMessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'voice_offer':
          handleOffer(data.content);
          break;
        case 'voice_answer':
          handleAnswer(data.content);
          break;
        case 'voice_ice_candidate':
          handleIceCandidate(data.content);
          break;
        case 'voice_participants_update':
          handleParticipantsUpdate(data.content);
          break;
        case 'voice_muted':
          if (data.content.muted_by_host) {
            setMutedByHost(true);
            setIsMuted(true);
            muteMicrophone();
          }
          break;
        case 'voice_unmuted':
          if (data.content.unmuted_by_host) {
            setMutedByHost(false);
          }
          break;
      }
    };
    
    // Add event listener to the WebSocket
    socketRef.current.addEventListener('message', handleSocketMessage);
    
    // Clean up event listener
    return () => {
      socketRef.current.removeEventListener('message', handleSocketMessage);
    };
  }, [roomId, userEmail]);

  // Handle voice call participants update
  const handleParticipantsUpdate = (content) => {
    const { participants: newParticipants } = content;
    setParticipants(newParticipants);
    
    // Check if current user is muted by host
    const currentUser = newParticipants.find(p => p.user_id === userId);
    if (currentUser && currentUser.muted_by_host) {
      setMutedByHost(true);
      setIsMuted(true);
      muteMicrophone();
    }
    
    // Create peer connections for new participants
    newParticipants.forEach(participant => {
      if (participant.user_id !== userId && isCallActive && !peerConnectionsRef.current[participant.user_id]) {
        createPeerConnection(participant.user_id);
      }
    });
  };

  // Start voice call
  const startVoiceCall = async () => {
    try {
      // Initialize WebRTC audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;
      
      // Create audio context and processing
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      audioDestinationRef.current = audioContextRef.current.createMediaStreamDestination();
      
      // Add this user to voice participants
      const joinMessage = {
        type: 'voice_join',
        content: {
          user_id: userId,
          user_email: userEmail
        }
      };
      socketRef.current.send(JSON.stringify(joinMessage));
      
      setIsCallActive(true);
      
      // Apply mute state if necessary
      if (isMuted) {
        muteMicrophone();
      }
    } catch (error) {
      console.error("Error starting voice call:", error);
    }
  };

  // End voice call
  const endVoiceCall = () => {
    // Close all peer connections
    Object.values(peerConnectionsRef.current).forEach(pc => {
      pc.close();
    });
    peerConnectionsRef.current = {};
    
    // Stop local media stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      audioDestinationRef.current = null;
      audioSourcesRef.current = {};
    }
    
    // Send leave message
    const leaveMessage = {
      type: 'voice_leave',
      content: {
        user_id: userId
      }
    };
    socketRef.current.send(JSON.stringify(leaveMessage));
    
    setIsCallActive(false);
  };

  // Toggle mute state
  const toggleMute = () => {
    if (mutedByHost && !isMuted) return; // Cannot unmute if muted by host
    
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    
    if (newMuteState) {
      muteMicrophone();
      // Notify others about self-mute
      const selfMuteMessage = {
        type: 'voice_self_mute',
        content: {
          user_id: userId
        }
      };
      socketRef.current.send(JSON.stringify(selfMuteMessage));
    } else {
      unmuteMicrophone();
      // Notify others about self-unmute
      const selfUnmuteMessage = {
        type: 'voice_self_unmute',
        content: {
          user_id: userId
        }
      };
      socketRef.current.send(JSON.stringify(selfUnmuteMessage));
    }
  };

  // Mute microphone
  const muteMicrophone = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = false;
      });
    }
  };

  // Unmute microphone
  const unmuteMicrophone = () => {
    if (localStreamRef.current && !mutedByHost) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = true;
      });
    }
  };

  // Mute or unmute a participant (host only)
  const toggleParticipantMute = (participantId) => {
    if (!isHost) return;
    
    const participant = participants.find(p => p.user_id === participantId);
    if (!participant) return;
    
    const messageType = participant.is_muted ? 'voice_unmute_user' : 'voice_mute_user';
    
    const muteMessage = {
      type: messageType,
      content: {
        user_id: participantId,
        is_host: true
      }
    };
    
    socketRef.current.send(JSON.stringify(muteMessage));
  };

  // Create a new WebRTC peer connection
  const createPeerConnection = (peerId) => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
    
    const peerConnection = new RTCPeerConnection(configuration);
    peerConnectionsRef.current[peerId] = peerConnection;
    
    // Add local stream tracks to the connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current);
      });
    }
    
    // ICE candidate event
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        const message = {
          type: 'voice_ice_candidate',
          content: {
            candidate: event.candidate,
            sender: userId,
            target: peerId
          }
        };
        socketRef.current.send(JSON.stringify(message));
      }
    };
    
    // Track event - when we receive audio from a peer
    peerConnection.ontrack = (event) => {
      // Create new audio source from the track
      if (audioContextRef.current) {
        const audioSource = audioContextRef.current.createMediaStreamSource(new MediaStream([event.track]));
        audioSource.connect(audioDestinationRef.current);
        audioSourcesRef.current[peerId] = audioSource;
        
        // Create an audio element to play the stream
        const audioElement = new Audio();
        audioElement.srcObject = new MediaStream([event.track]);
        audioElement.play();
      }
    };
    
    // Create and send offer (if we're the initiator)
    if (participants.length > 0 && participants[0].user_id === userId) {
      peerConnection.createOffer()
        .then(offer => peerConnection.setLocalDescription(offer))
        .then(() => {
          const message = {
            type: 'voice_offer',
            content: {
              offer: peerConnection.localDescription,
              sender: userId,
              target: peerId
            }
          };
          socketRef.current.send(JSON.stringify(message));
        })
        .catch(error => console.error("Error creating offer:", error));
    }
    
    return peerConnection;
  };

  // Handle an offer from a peer
  const handleOffer = async (content) => {
    const { offer, sender } = content;
    
    // Create peer connection if it doesn't exist
    if (!peerConnectionsRef.current[sender]) {
      createPeerConnection(sender);
    }
    
    const peerConnection = peerConnectionsRef.current[sender];
    
    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      const message = {
        type: 'voice_answer',
        content: {
          answer: peerConnection.localDescription,
          sender: userId,
          target: sender
        }
      };
      socketRef.current.send(JSON.stringify(message));
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  };

  // Handle an answer from a peer
  const handleAnswer = async (content) => {
    const { answer, sender } = content;
    
    const peerConnection = peerConnectionsRef.current[sender];
    if (peerConnection) {
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        console.error("Error handling answer:", error);
      }
    }
  };

  // Handle an ICE candidate from a peer
  const handleIceCandidate = async (content) => {
    const { candidate, sender } = content;
    
    const peerConnection = peerConnectionsRef.current[sender];
    if (peerConnection) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Error handling ICE candidate:", error);
      }
    }
  };

  // Get display name from email
  const getDisplayName = (email) => {
    const name = email.split("@")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div className="flex flex-col py-2">
      {/* Voice call controls */}
      <div className={`p-2 border-t ${colors.border} flex justify-center space-x-4`}>
        <button
          onClick={isCallActive ? toggleMute : startVoiceCall}
          className={`p-2 rounded-full ${isCallActive ? (isMuted ? colors.buttonInactiveBg : colors.buttonActiveBg) : colors.buttonActiveBg} ${colors.buttonHover}`}
          disabled={mutedByHost && !isMuted}
        >
          {isCallActive ? 
            (isMuted ? <MicOff size={14} /> : <Mic size={14} className="text-white" />) : 
            <Mic size={14} className="text-white" />
          }
        </button>
        
        {isCallActive && (
          <button
            onClick={endVoiceCall}
            className="p-2 rounded-full bg-red-500 hover:bg-red-600"
          >
            <PhoneOff size={14} className="text-white" />
          </button>
        )}
        
        {!isCallActive && (
          <button
            onClick={startVoiceCall}
            className="p-2 rounded-full bg-green-500 hover:bg-green-600"
          >
            <Phone size={14} className="text-white" />
          </button>
        )}
      </div>
      
      {/* Notification for host mute */}
      {mutedByHost && (
        <div className="p-2 bg-yellow-500 text-center text-sm">
          You have been muted by the host
        </div>
      )}
    </div>
  );
}