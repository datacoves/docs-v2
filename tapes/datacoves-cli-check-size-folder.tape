Output "../docs/reference/vscode/assets/datacoves-cli-check-size-folder.gif"
Source "_settings.tape"
Set Height 900
Source "_enter-code-server.tape"

Type "datacoves check_size_folder --folder ."
Enter
Wait@120s /\$\s*$/
Sleep 5s
Type "clear"
Enter
Type "cd transform"
Enter
Type "datacoves check_size_folder --folder target"
Enter
Wait@120s /\$\s*$/
Sleep 5s
