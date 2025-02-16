import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
];

const themes = [
  { value: "vs-dark", label: "Dark (VS Code)" },
  { value: "light", label: "Light" },
  { value: "hc-black", label: "High Contrast Dark" },
  { value: "hc-light", label: "High Contrast Light" },
];

const fonts = [
  { value: "Fira Code", label: "Fira Code" },
  { value: "JetBrains Mono", label: "JetBrains Mono" },
  { value: "Cascadia Code", label: "Cascadia Code" },
  { value: "Source Code Pro", label: "Source Code Pro" },
  { value: "Monaco", label: "Monaco" },
];

export default function Settings({
  language,
  setLanguage,
  theme,
  setTheme,
  font,
  setFont,
  fontSize,
  setFontSize,
}) {
  return (
    <div className="w-64 h-full bg-[#252526] p-4 border-r border-gray-800">
      <h2 className="text-sm font-semibold mb-6 text-gray-400">SETTINGS</h2>

      <div className="space-y-6">
        {/* Language Setting */}
        <div className="space-y-2">
          <Label className="text-xs text-gray-400">Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full bg-[#3c3c3c] border-none text-gray-300">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem
                  key={lang.value}
                  value={lang.value}
                  className="text-gray-300"
                >
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Theme Setting */}
        <div className="space-y-2">
          <Label className="text-xs text-gray-400">Theme</Label>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="w-full bg-[#3c3c3c] border-none text-gray-300">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              {themes.map((themeOption) => (
                <SelectItem
                  key={themeOption.value}
                  value={themeOption.value}
                  className="text-gray-300"
                >
                  {themeOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Font Setting */}
        <div className="space-y-2">
          <Label className="text-xs text-gray-400">Font Family</Label>
          <Select value={font} onValueChange={setFont}>
            <SelectTrigger className="w-full bg-[#3c3c3c] border-none text-gray-300">
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              {fonts.map((fontOption) => (
                <SelectItem
                  key={fontOption.value}
                  value={fontOption.value}
                  className="text-gray-300"
                >
                  {fontOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Font Size Setting */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs text-gray-400">Font Size</Label>
            <span className="text-xs text-gray-400">{fontSize}px</span>
          </div>
          <Slider
            value={[fontSize]}
            onValueChange={([value]) => setFontSize(value)}
            min={8}
            max={32}
            step={1}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
