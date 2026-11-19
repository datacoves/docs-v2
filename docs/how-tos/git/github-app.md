---
title: "Set Up a GitHub App for Repository Access in Datacoves"
sidebar_label: "GitHub App"
description: "Register a private GitHub App, install it on your repository, and give Datacoves its client ID and private key instead of a deploy key."
sidebar_position: 72
---
# How to set up a GitHub App for repository access

For a repository on github.com, Datacoves authenticates with a GitHub App. The setup wizard and new projects
start on it, and it also works in organizations that disable deploy keys. The App gives Datacoves services
read-only access to the repository contents. To run the setup wizard, you still add a developer SSH key to
your own GitHub account.

## What you need

- Admin rights on the GitHub organization, to register the App.
- Admin rights on the repository, to install the App on it.

## 1. Register the App

1. Open the organization settings, Developer settings, GitHub Apps, and select **New GitHub App**.
2. Set a name such as `datacoves-<company>` and a homepage URL. The webhook can be switched off.
3. Under **Repository permissions**, set **Contents** to **Read-only** and leave **Metadata** at its default
   **Read-only**. No other permission is needed.
4. Under **Where can this GitHub App be installed?**, select **Only on this account**.
5. Select **Create GitHub App**.

## 2. Generate a private key and copy the client ID

1. The App page shows its **Client ID**. Copy it.
2. Scroll to **Private keys** and select **Generate a private key**. GitHub downloads a `.pem` file. Keep it,
   the private key is shown only once.

## 3. Install the App on the repository

1. On the App page select **Install App** and pick the organization.
2. Choose **Only select repositories**, select the repository Datacoves will use, and select **Install**.
3. If you add another repository later, come back to the installation and add it there.

Datacoves finds the installation ID by itself from the repository, so there is nothing else to copy.

## 4. Add the App to a Datacoves project

### In the setup wizard

1. Enter the repository SSH URL, for example `git@github.com:organization/repo.git`, and the release branch.
   The URL must be on `github.com`.
2. Leave **Authentication** on **GitHub App**, where it starts.
3. Paste the **Client ID** and the **Private key**.
4. Select an **SSH key type**. The wizard shows your **SSH Developer Key**. Copy it.
5. In GitHub, open Settings, SSH and GPG keys, and select **New SSH key**. Paste the key and save it.
6. If your organization enforces SSO, authorize the key for the organization on the same page.
7. Select **Next**.

### In a new project

A new project starts with **Clone strategy** on **GitHub App**. Fill in the **Git SSH url**, the **Git HTTPS
url**, the **Client ID** and the **Private key**, then select **Save Changes**.

### In an existing project

1. Open the project, set **Clone strategy** to **GitHub App**.
2. The **Git SSH url** stays as it is, and it is locked once the project is validated. The **Git HTTPS url**
   is locked too once it holds a value; fill it in when the project has none. Enter the **Client ID** and the
   **Private key**. Leave the private key empty on later edits to keep the stored one.
3. Select **Save Changes**. Datacoves saves the installation ID it looks up from the repository and tests
   the connection.

## What Datacoves stores

- The client ID, the private key and the installation ID, encrypted at rest with the project.
- The API never returns the private key.

## What a GitHub App does not cover

- **Personal development clones.** The App doesn't clone the repository for developers. Each developer adds
  their own SSH key under User Settings, Git SSH Keys. Then code-server clones the repository for them. The
  person who ran the setup wizard already added their key in that step.
- **Repositories outside the installation.** A repository the App is not installed on fails the connection
  test with GitHub's answer. Add it to the installation.
