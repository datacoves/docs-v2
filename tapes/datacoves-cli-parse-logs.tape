Output "../docs/reference/vscode/assets/datacoves-cli-parse-logs.gif"
Source "_settings.tape"
Set FontSize 14
Set Height 1000
Source "_enter-code-server.tape"

Type "datacoves my parse-logs"
Enter
Wait@60s /\$\s*$/
Sleep 5s
Type "clear"
Enter
Type "datacoves my parse-logs --file blue_green -n 6"
Enter
Wait@60s /\$\s*$/
Sleep 5s
