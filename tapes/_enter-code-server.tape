# Open a shell as the VS Code user (abc) in a running code-server pod, with
# exactly the environment VS Code gives its terminals: code-server starts with
# `env -i` and a short list of variables, so a plain `kubectl exec` shell (the
# container's full environment) would not match. $CS_NAMESPACE and $CS_POD come
# from the environment (see README.md). Hidden from the recording.
Hide
Type `kubectl exec -it -n $CS_NAMESPACE $CS_POD -c code-server -- s6-setuidgid abc bash -c 'P=$(pgrep -f "bind-addr 0.0.0.0:8443" | head -1); exec xargs -0 -a /proc/$P/environ sh -c "exec env -i TERM=xterm-256color \"\$@\" bash -i" _'`
Enter
Sleep 4s
Type `cd /config/workspace 2>/dev/null; PS1='\[\e[32m\]$ \[\e[0m\]'; clear`
Enter
Sleep 1s
Show
