---
title: Add EntraID App to DevOps Portal
sidebar: false
---
# Add Application as a user in DevOps Portal

<u>**Step 1**</u>

- In another tab (you will need to return to your application later), sign in to your [Azure DevOps Portal](https://dev.azure.com) and click `Organization settings` at the bottom of the left navigation.

![Organization Settings](./assets/azure_devops_organization_settings.png)

<u>**Step 2**</u>

- Select `Users` in the left navigation menu.

![Organization Navbar](./assets/azure_devops_user_nav.png)

<u>**Step 3**</u>

- Select `Add Users` to add the application to the user list.

![Add User button](./assets/azure_devops_add_user_button.png)

<u>**Step 4**</u>

- Set the user as the application you created above, give it Basic Access.

![Add User menu](./assets/azure_devops_add_user_menu.png)

<u>**Step 5**</u>

- Select the project you wish to add the application to using the `Add to projects` dropdown, and select the `Send email invites` checkbox.

![Add to project](./assets/azure_devops_assign_to_project.png)

✅ Now that you have created your EntraID application and added it as a user in the DevOps Portal you will need to set up an [authentication method](/how-tos/datacoves/authenticate_azure_devops.md)
