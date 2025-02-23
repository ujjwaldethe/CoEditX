import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

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
  languages,
  theme,
  setTheme,
  font,
  setFont,
  fontSize,
  setFontSize,
}) {
  const isDark = theme === "vs-dark" || theme === "hc-black";

  const colors = {
    text: isDark ? "text-gray-300" : "text-gray-800",
    textMuted: isDark ? "text-gray-400" : "text-gray-500",
    background: isDark ? "bg-[#3c3c3c]" : "bg-gray-100",
    selectBackground: isDark ? "bg-[#3c3c3c]" : "bg-white",
    border: isDark ? "border-gray-700" : "border-gray-200",
    hover: isDark ? "hover:bg-[#4c4c4c]" : "hover:bg-gray-50",
  };

  return (
    <div className="w-full h-full">
      <h2 className={`text-sm font-semibold mb-6 ${colors.textMuted}`}>
        SETTINGS
      </h2>

      <div className="space-y-6">
        {/* Language Setting */}
        <div className="space-y-2">
          <Label className={`text-xs ${colors.textMuted}`}>Language</Label>
          <Select
            value={language.label}
            onValueChange={(value) => {
              const selectedLang = languages.find(
                (lang) => lang.label === value
              );
              if (selectedLang) {
                setLanguage(selectedLang);
              }
            }}
          >
            <SelectTrigger
              className={`w-full ${colors.selectBackground} border-none ${colors.text}`}
            >
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem
                  key={lang.label}
                  value={lang.label}
                  className="text-gray-800"
                >
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Theme Setting */}
        <div className="space-y-2">
          <Label className={`text-xs ${colors.textMuted}`}>Theme</Label>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger
              className={`w-full ${colors.selectBackground} border-none ${colors.text}`}
            >
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              {themes.map((themeOption) => (
                <SelectItem
                  key={themeOption.value}
                  value={themeOption.value}
                  className="text-gray-800"
                >
                  {themeOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Font Setting */}
        <div className="space-y-2">
          <Label className={`text-xs ${colors.textMuted}`}>Font Family</Label>
          <Select value={font} onValueChange={setFont}>
            <SelectTrigger
              className={`w-full ${colors.selectBackground} border-none ${colors.text}`}
            >
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              {fonts.map((fontOption) => (
                <SelectItem
                  key={fontOption.value}
                  value={fontOption.value}
                  className="text-gray-800"
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
            <Label className={`text-xs ${colors.textMuted}`}>Font Size</Label>
            <span className={`text-xs ${colors.textMuted}`}>{fontSize}px</span>
          </div>
          <Slider
            value={[fontSize]}
            onValueChange={([value]) => setFontSize(value)}
            min={8}
            max={32}
            step={1}
            className={`w-full ${colors.selectBackground}`}
          />
        </div>
      </div>
    </div>
  );
}
