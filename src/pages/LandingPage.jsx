export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white overflow-x-hidden">
      {/* Decorative elements */}
      <div className="absolute top-[5%] right-[10%] w-48 h-48 rounded-full bg-pink-500/15 blur-3xl"></div>
      <div className="absolute bottom-[5%] left-[10%] w-64 h-64 rounded-full bg-teal-400/15 blur-3xl"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navbar */}
        <nav className="flex justify-between items-center py-6 relative z-10">
          <div className="flex items-center">
            <img src="/logo.jpeg" alt="CoEditX Logo" className="h-10" />
            <span className="ml-3 text-xl font-bold bg-gradient-to-r from-teal-400 to-pink-500 bg-clip-text text-transparent">
              CoEditX
            </span>
          </div>
          <div className="flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-200 hover:text-pink-500 font-medium transition-colors"
            >
              Features
            </a>
            <a
              href="#about"
              className="text-gray-200 hover:text-pink-500 font-medium transition-colors"
            >
              About
            </a>
            <a
              href="/login"
              className="bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Login
            </a>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="py-16 flex flex-col lg:flex-row items-center justify-between">
          <div className="max-w-lg lg:pr-8 mb-12 lg:mb-0 relative z-1">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-white to-teal-400 bg-clip-text text-transparent">
              Code in Real Time. Together.
            </h1>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Experience seamless collaborative coding with CoEditX. Join
              virtual rooms, write code simultaneously, and see changes in
              real-time across multiple programming languages.
            </p>
            <a
              href="/login"
              className="inline-block bg-gradient-to-r from-pink-500 to-pink-600 px-8 py-4 rounded-lg font-semibold text-white transition transform hover:-translate-y-1 hover:shadow-lg"
            >
              Join a Room
            </a>
          </div>

          <div className="w-full lg:w-1/2 relative">
            <div className="relative">
              {/* Code brackets decoration */}
              <div className="absolute -top-3 -right-3 w-4 h-14 border-t-2 border-r-2 border-teal-400 rounded-tr-lg"></div>
              <div className="absolute -bottom-3 -left-3 w-4 h-14 border-b-2 border-l-2 border-teal-400 rounded-bl-lg"></div>

              <img
                src="/logo.jpeg"
                alt="Code Editor Interface"
                className="w-full rounded-xl shadow-2xl border border-white/10"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 relative z-1">
          <h2 className="text-4xl font-bold text-center mb-12">
            Powerful Collaboration Tools
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon="💻"
              title="Real-Time Code Editing"
              description="See changes as they happen across all connected users in the room, enabling true collaborative development."
            />

            <FeatureCard
              icon="🔊"
              title="Group Voice Calls"
              description="Communicate seamlessly with your team while coding with integrated voice call capabilities."
            />

            <FeatureCard
              icon="💬"
              title="Dedicated Chat"
              description="Share ideas, links, and feedback in a dedicated chat window without interrupting your coding workflow."
            />

            <FeatureCard
              icon="🚀"
              title="Multi-Language Support"
              description="Code in Java, Python, JavaScript, C, and C++ with syntax highlighting and language-specific features."
            />

            <FeatureCard
              icon="👥"
              title="Multiple Users"
              description="Invite team members to join your room with simple room IDs, similar to virtual meeting platforms."
            />

            <FeatureCard
              icon="⬇️"
              title="Code Download"
              description="Download the codebase at any point to save your progress or continue working offline."
            />
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 relative z-1">
          <h2 className="text-4xl font-bold text-center mb-12">Why CoEditX?</h2>

          <div className="bg-gray-900/60 border border-white/5 rounded-2xl p-10 text-center">
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              CoEditX brings the simplicity of collaborative platforms like
              Google Meet to the world of coding. Whether you are teaching, pair
              programming, or working on a distributed team, our real-time
              editor makes coding together effortless.
            </p>
            <a
              href="/login"
              className="inline-block bg-gradient-to-r from-pink-500 to-pink-600 px-8 py-4 rounded-lg font-semibold text-white transition transform hover:-translate-y-1 hover:shadow-lg"
            >
              Start Coding Together
            </a>
          </div>
        </section>
      </div>

      {/* Footer with Marquee */}
      <footer className="border-t border-white/10 mt-12 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="overflow-hidden w-full my-4">
            <div className="flex animate-bounce mb-8">
              <div className="mx-8 text-gray-400">
                <span className="text-teal-400">
                  Late G N Sapkal Collage Of Engineering
                </span>
              </div>
              <div className="mx-8 text-gray-400">
                <span className="text-teal-400">Mahesh Sanap</span>
              </div>
              <div className="mx-8 text-gray-400">
                <span className="text-teal-400">Ujjwal Dethe</span>
              </div>
              <div className="mx-8 text-gray-400">
                <span className="text-teal-400">Pratik Chaudhari</span>
              </div>
              <div className="mx-8 text-gray-400">
                <span className="text-teal-400">Swaraj Deshmukh</span>
              </div>
            </div>
          </div>
          <p className="text-center text-gray-500 mt-4">
            © 2025 CoEditX. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-gray-900/60 rounded-xl p-8 border border-white/5 transition transform hover:-translate-y-1 hover:shadow-xl relative overflow-hidden group">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-400 to-pink-500"></div>
      <div className="text-4xl mb-6">{icon}</div>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
