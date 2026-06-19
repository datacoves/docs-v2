---
title: Troubleshooting
sidebar_position: 200
---

# Troubleshooting errors

If you hit an error page in Datacoves, it shows an HTTP status code (for example
`403`, `500`, or `503`). Most errors clear up on their own with a couple of
quick steps.

## First steps

1. **Log out and log back in.** Many errors are caused by an expired session.
   Use the user menu to log out, then sign in again.
2. **Wait a moment and retry.** If your environment was just started, it may
   still be coming online. Give it a minute and reload.

If the error keeps happening after these steps, contact us at
[support@datacoves.com](mailto:support@datacoves.com) and include the status
code shown on the error page.

## What the codes mean

### 400 - Bad Request {#400}

The request could not be completed. Log out and back in, then try again.

### 401 - Unauthorized {#401}

Your session is not valid. Log out and back in to sign in again.

### 403 - Forbidden {#403}

You are signed in but do not have permission for that action. Ask your account
administrator if you think you should have access.

### 404 - Not Found {#404}

The page or resource could not be found. Make sure the link is correct; if you
reached it from inside Datacoves, log out and back in and try again.

### 408 - Request Timeout {#408}

The request took too long. Wait a moment and retry.

### 409 - Conflict {#409}

The request conflicts with the current state (for example something already
exists). Refresh and try again.

### 422 - Unprocessable Entity {#422}

The request could not be processed. Check your input and try again.

### 429 - Too Many Requests {#429}

You have been rate limited. Wait a moment and retry.

### 500 - Internal Server Error {#500}

An unexpected error on our side. If it keeps happening, contact support and
include the code shown on the error page.

### 502 - Bad Gateway {#502}

Datacoves is temporarily unavailable or your environment is still starting.
Wait a moment and retry.

### 503 - Service Unavailable {#503}

Datacoves is temporarily unavailable or your environment is still starting.
Wait a moment and retry.

### 504 - Gateway Timeout {#504}

Datacoves took too long to respond. Wait a moment and retry.

### Connection problem {#connection}

We could not reach Datacoves. Check your internet connection, then log out and
back in.
