# Terminal recordings

The GIFs of the `datacoves` CLI in `docs/reference/vscode/assets/` are recorded with [VHS](https://github.com/charmbracelet/vhs) from the `.tape` files in this folder, so they can be recorded again whenever the CLI changes instead of going stale.

Each tape types into a real VS Code terminal: it opens a shell as the VS Code user in a running code-server pod (`_enter-code-server.tape`, hidden from the recording) and runs the commands there. `_settings.tape` holds the size, font and theme shared by all of them.

## Record them

You need a Datacoves environment with VS Code started (and My Airflow running, for `parse-logs`), `kubectl` access to its cluster, and Docker. VHS runs from its Docker image, which has no `kubectl`, so add it first:

```bash
cat > /tmp/Dockerfile.vhs <<'DOCKERFILE'
FROM ghcr.io/charmbracelet/vhs:latest
ARG KUBECTL=v1.32.3
ARG ARCH=arm64
RUN python3 -c "import urllib.request; urllib.request.urlretrieve('https://dl.k8s.io/release/${KUBECTL}/bin/linux/${ARCH}/kubectl', '/usr/local/bin/kubectl')" \
    && chmod +x /usr/local/bin/kubectl
DOCKERFILE
docker build -t vhs-kubectl -f /tmp/Dockerfile.vhs /tmp
```

Use `--build-arg ARCH=amd64` on an Intel machine. Then, from the root of this repository, for the local kind cluster (`dev123`, user `hey`):

```bash
kind get kubeconfig --internal --name datacoves-cluster > /tmp/kind-kubeconfig
for tape in tapes/datacoves-cli-*.tape; do
  docker run --rm --network kind \
    -v /tmp/kind-kubeconfig:/kubeconfig:ro -e KUBECONFIG=/kubeconfig \
    -e CS_NAMESPACE=dcw-dev123 -e CS_POD=code-server-hey-0 \
    -v "$PWD":/vhs -w /vhs/tapes vhs-kubectl "$(basename "$tape")"
done
```

Each tape writes its GIF straight into `docs/reference/vscode/assets/`. Look at it before committing: a command that took longer than usual can leave the next one typed over its output.
