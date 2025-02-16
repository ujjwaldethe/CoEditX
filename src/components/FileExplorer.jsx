import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import {
  FolderPlus,
  FilePlus,
  File,
  FolderClosed,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export default function FileExplorer({
  fileTree,
  setFileTree,
  activeFile,
  setActiveFile,
}) {
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newItemType, setNewItemType] = useState(null);
  const [newItemParentPath, setNewItemParentPath] = useState("/");
  const [newItemName, setNewItemName] = useState("");

  function addItem(parentPath, name, type) {
    if (!name) return;
    const newPath = `${parentPath === "/" ? "" : parentPath}/${name}`;
    const parent = findItemByPath(fileTree, parentPath);
    if (parent?.children?.some((child) => child.name === name)) {
      return;
    }

    const newItem = {
      type,
      name,
      path: newPath,
      ...(type === "folder"
        ? { isOpen: true, children: [] }
        : { content: "// Write your code here\n" }),
    };

    const updateTree = (tree) => {
      if (tree.path === parentPath) {
        return {
          ...tree,
          isOpen: true,
          children: [...(tree.children || []), newItem],
        };
      }
      if (tree.children) {
        return {
          ...tree,
          children: tree.children.map((child) => updateTree(child)),
        };
      }
      return tree;
    };

    setFileTree(updateTree(fileTree));
    setIsCreatingNew(false);
    setNewItemName("");
  }

  function handleFileAction(action) {
    if (action.type === "newFile" || action.type === "newFolder") {
      setNewItemType(action.type === "newFile" ? "file" : "folder");
      setNewItemParentPath(action.parent);
      setIsCreatingNew(true);
      setNewItemName("");
    } else if (action.type === "file") {
      setActiveFile(action);
    }
  }

  function deleteItem(path) {
    const updateTree = (tree) => {
      if (tree.children) {
        return {
          ...tree,
          children: tree.children
            .filter((child) => child.path !== path)
            .map((child) => updateTree(child)),
        };
      }
      return tree;
    };

    setFileTree(updateTree(fileTree));
    if (activeFile?.path === path) {
      const firstFile = findFirstFile(fileTree);
      setActiveFile(firstFile);
    }
  }

  function renameItem(path, newName) {
    const item = findItemByPath(fileTree, path);
    if (!item) return;

    const parentPath = path.split("/").slice(0, -1).join("/");
    const parent = findItemByPath(fileTree, parentPath || "/");
    if (
      parent?.children?.some(
        (child) => child.name === newName && child.path !== path
      )
    ) {
      return;
    }

    const newPath = path.split("/").slice(0, -1).concat(newName).join("/");
    const updateTree = (tree) => {
      if (tree.path === path) {
        return {
          ...tree,
          name: newName,
          path: newPath,
          ...(tree.children
            ? {
                children: tree.children.map((child) => ({
                  ...child,
                  path: child.path.replace(path, newPath),
                })),
              }
            : {}),
        };
      }
      if (tree.children) {
        return {
          ...tree,
          children: tree.children.map((child) => updateTree(child)),
        };
      }
      return tree;
    };

    setFileTree(updateTree(fileTree));
    if (activeFile?.path === path) {
      setActiveFile((prev) => ({ ...prev, path: newPath, name: newName }));
    }
  }

  const toggleFolder = (item) => {
    const updateTree = (tree) => {
      if (tree.path === item.path) {
        return { ...tree, isOpen: !tree.isOpen };
      }
      if (tree.children) {
        return {
          ...tree,
          children: tree.children.map((child) => updateTree(child)),
        };
      }
      return tree;
    };

    setFileTree(updateTree(fileTree));
  };

  function findItemByPath(tree, path) {
    if (tree.path === path) return tree;
    if (tree.children) {
      for (const child of tree.children) {
        const found = findItemByPath(child, path);
        if (found) return found;
      }
    }
    return null;
  }

  function findFirstFile(tree) {
    if (tree.type === "file") return tree;
    if (tree.children) {
      for (const child of tree.children) {
        const file = findFirstFile(child);
        if (file) return file;
      }
    }
    return null;
  }

  return (
    <div className="w-64 bg-[#252526] p-4 border-r border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-400">FILES</h2>
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-1 hover:bg-[#2d2d2d] rounded"
                  onClick={() => {
                    setNewItemType("file");
                    setNewItemParentPath("/");
                    setIsCreatingNew(true);
                    setNewItemName("");
                  }}
                >
                  <FilePlus className="h-4 w-4 text-gray-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>New File (Ctrl+N)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-1 hover:bg-[#2d2d2d] rounded"
                  onClick={() => {
                    setNewItemType("folder");
                    setNewItemParentPath("/");
                    setIsCreatingNew(true);
                    setNewItemName("");
                  }}
                >
                  <FolderPlus className="h-4 w-4 text-gray-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>New Folder</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Dialog open={isCreatingNew} onOpenChange={setIsCreatingNew}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Create New {newItemType === "file" ? "File" : "Folder"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder={`Enter ${newItemType} name...`}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newItemName) {
                  addItem(newItemParentPath, newItemName, newItemType);
                } else if (e.key === "Escape") {
                  setIsCreatingNew(false);
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() =>
                addItem(newItemParentPath, newItemName, newItemType)
              }
            >
              Create
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-1">
        <FileExplorerItem
          item={fileTree}
          onSelect={handleFileAction}
          onToggle={toggleFolder}
          onDelete={deleteItem}
          onRename={renameItem}
          activeFile={activeFile}
        />
      </div>
    </div>
  );
}

const FileExplorerItem = ({
  item,
  level = 0,
  onSelect,
  onToggle,
  onDelete,
  onRename,
  activeFile,
}) => {
  const isFolder = item.type === "folder";
  const isActive = activeFile?.path === item.path;
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(item.name);

  const handleRename = () => {
    if (newName && newName !== item.name) {
      onRename(item.path, newName);
    }
    setIsRenaming(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      setIsRenaming(false);
      setNewName(item.name);
    }
  };

  const contextMenuItems = [
    ...(isFolder
      ? [
          {
            label: "New File",
            action: () => onSelect({ type: "newFile", parent: item.path }),
          },
          {
            label: "New Folder",
            action: () => onSelect({ type: "newFolder", parent: item.path }),
          },
          { type: "separator" },
        ]
      : []),
    { label: "Rename", shortcut: "F2", action: () => setIsRenaming(true) },
    { label: "Delete", shortcut: "Del", action: () => onDelete(item.path) },
  ];

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div>
          <div
            className={`group flex items-center space-x-2 p-1 hover:bg-[#2d2d2d] rounded cursor-pointer ${
              isActive ? "bg-[#2d2d2d]" : ""
            }`}
            style={{ paddingLeft: `${level * 16}px` }}
            onClick={() => !isFolder && onSelect(item)}
          >
            {isFolder && (
              <button
                className="p-0.5 hover:bg-[#3d3d3d] rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(item);
                }}
              >
                {item.isOpen ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </button>
            )}
            {isFolder ? (
              <FolderClosed className="h-4 w-4 text-gray-400" />
            ) : (
              <File className="h-4 w-4 text-gray-400" />
            )}
            {isRenaming ? (
              <Input
                className="h-6 py-0 px-1 bg-[#3d3d3d] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={handleKeyDown}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="text-sm flex-1">{item.name}</span>
            )}
          </div>
          {isFolder &&
            item.isOpen &&
            item.children?.map((child) => (
              <FileExplorerItem
                key={child.path}
                item={child}
                level={level + 1}
                onSelect={onSelect}
                onToggle={onToggle}
                onDelete={onDelete}
                onRename={onRename}
                activeFile={activeFile}
              />
            ))}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {contextMenuItems.map((item, index) =>
          item.type === "separator" ? (
            <ContextMenuSeparator key={index} />
          ) : (
            <ContextMenuItem
              key={index}
              onClick={item.action}
              className="flex justify-between"
            >
              <span>{item.label}</span>
              {item.shortcut && (
                <span className="text-xs text-gray-500">{item.shortcut}</span>
              )}
            </ContextMenuItem>
          )
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};
