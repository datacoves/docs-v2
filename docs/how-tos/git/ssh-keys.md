---
title: "Configure SSH Keys for Git Repos in Datacoves"
sidebar_label: "SSH Keys"
description: "Generate and configure SSH keys in Datacoves to clone git repositories, including adding your public key as a deployment key in GitHub or GitLab."
sidebar_position: 71
---
# How to configure a SSH Key to clone a git repository

## Clone a Git repository for development purposes (write access required)

[Github SSH user keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)

[Gitlab SSH user keys](https://www.theserverside.com/blog/Coffee-Talk-Java-News-Stories-and-Opinions/How-to-configure-GitLab-SSH-keys-for-secure-Git-connections#:~:text=Configure%20GitLab%20SSH%20keys,-Log%20into%20GitLab%20and%20click)

[Bitbucket SSH user keys](https://dev.to/jorge_rockr/configuring-ssh-key-for-bitbucket-repositories-2925)

### GitHub organizations with SAML SSO

If your GitHub organization uses SAML single sign-on, clicking **Test** in User Settings, Git SSH Keys shows
`Could not connect to the Git repository`, and its details show this error:

```
ERROR: The '<organization>' organization has enabled or enforced SAML SSO. To access this repository, you must
use the HTTPS remote with a personal access token or SSH with an SSH key and passphrase that has been
authorized for this organization.
```

Authorize the key for your organization in GitHub:

1. Click your profile picture, then **Settings**.
2. Click **SSH and GPG keys**.
3. Next to the key you added from Datacoves, click **Configure SSO**.
4. Next to your organization, click **Authorize**.

Then click **Test** in Datacoves again. See
[Authorizing an SSH key for use with single sign-on](https://docs.github.com/en/authentication/authenticating-with-single-sign-on/authorizing-an-ssh-key-for-use-with-single-sign-on).

## Clone a Git repository for deployment purposes (read-only access)

[Github SSH deploy keys](https://docs.github.com/en/developers/overview/managing-deploy-keys)

[Gitlab SSH deploy keys](https://docs.gitlab.com/ee/user/project/deploy_keys/)

[Bitbucket SSH deploy keys](https://support.atlassian.com/bitbucket-cloud/docs/add-access-keys/)
