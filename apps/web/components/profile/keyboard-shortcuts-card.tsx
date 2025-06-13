import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card"

export const KeyboardShortcutsCard = () => {
  const shortcuts = [
    { name: "Search", keys: ["Ctrl", "K"] },
    { name: "New Chat", keys: ["Ctrl", "Shift", "O"] },
    { name: "Toggle Sidebar", keys: ["Ctrl", "B"] },
  ]

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Keyboard Shortcuts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {shortcuts.map((shortcut) => (
          <div key={shortcut.name} className="flex justify-between items-center">
            <p className="text-sm text-slate-700">{shortcut.name}</p>
            <div className="flex gap-1">
              {shortcut.keys.map((key) => (
                <kbd key={key} className="px-2 py-1 text-xs font-sans bg-slate-200 text-slate-600 rounded">
                  {key}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
