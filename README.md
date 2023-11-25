# AI File Agent

![AI File Agent screenshot](https://blockchainassetregistry.infura-ipfs.io/ipfs/bafybeigtxmjowf7efxar3lel3kw63hsnogkimmb6azwqcrli55ekswifr4/Screenshot%202023-10-15%20at%2011.52.51.png)

Analyze API and file data with natural language and a nice UI.

- [Features](#features)
- [Development](#development)
- [Launching-client](#launching-client)
- [Debugging](#debugging)
- [Contributing](#contributing)

<a name="features"/>

## Features

AI File Agent is not only another AI chat UI, it allows you to upload any file and create custom components to render with each message, for example:

```typescript
messageContext.updateMessage({
    role: "assistant",
    content: `File "${file.name}" uploaded successfully. What would you like to do with it?`,
    beforeContentComponent: (
        <Typography.Description>
        NOTE: This file is assigned to a temporary account.{" "}
        <Typography.Link href="#">Create an account</Typography.Link> to keep it.
        </Typography.Description>
    ),
    afterContentComponent: <MessageFileType.Options file={file} fieldName={FormFieldNames.message} />,
    type: "file",
    file,
    id: messageContext.transformId(file.upload!.uuid),
});
```

Then, in the `MessageFileType.tsx` component:

```tsx
export const MessageFileType = ({ message, className }: MessageFileTypeProps) => {
  const isSimulationEnabled = message.role === "assistant" && !message.hasInnerHtml;

  const { simulationEnded } = useTypingSimulation(message.content, isSimulationEnabled, `#${message.id}`);

  const progress: number = useSubscription(0, message.file.progressObservable);

  return (
    <div className={clsx(styles["message-file-type"], className)}>
      <div>
        <div className={styles["message-file-type__avatar"]}>
          <div className={styles["message-file-type__avatar-box"]}>
            {progress === 100 ? (
              <Icon name="icon-file-check" />
            ) : (
              <CircularProgress color="#ffd74b" percentage={progress} fontSize="21px" />
            )}
          </div>
        </div>
        <div className={styles["message-file-type__content"]}>
          {message.beforeContentComponent && simulationEnded && message.beforeContentComponent}

          {!isSimulationEnabled ? (
            <Typography.Text>{message.content}</Typography.Text>
          ) : (
            <Typography.Text id={message.id} />
          )}

          {message.afterContentComponent && simulationEnded && message.afterContentComponent}
        </div>
      </div>
    </div>
  );
};
```

### Plus

- ✅ Upload any file of any size, display a nice uploading animation all within the chat interface
- ✅ Standard GoogleAI and OpenAI choice responses. Should work with more LM's in the future
- ✅ Animated assistant replies (typing animation)
- ✅ Variable height `textarea`
- ✅ API authentication handler
- ✅ `function_call` message type handler to call server-side functions
- ✅ Custom `label` values to render TSX components upon a given AI reply
- ✅ Well-typed Typescript interfaces to keep your dev flow groovin'
- ✅ Mobile-first design
- ✅ Dark and Light theming
- ✅ i18n ready
- ✅ Optional Tailwind CSS components and optional Shadcn UI components
- ✅ Open-source with paid bounties! 🤑

<a name="development"/>

## Development

Follow `app/README.md` for a detailed explanation of launching the dev environment.

<a name="launching-client"/>

### Launching the frontend client

The client is a NextJS application.

To launch on `localhost:3003`, first clone this repo and run:

```
git@github.com:aufacicenta/fileagent.git
cd fileagent
yarn
cd app
yarn
yarn dev:debug
```

You'll need these values in `app/.env`:

```bash
export NODE_ENV=test
export NEXT_PUBLIC_ORIGIN="http://localhost:3003"

export NEXT_PUBLIC_CHAT_AI_API="googleai" # "googleai" OR "openai"

# NANONETS, for OCR features: https://nanonets.com/
export NANONETS_API_KEY="..."

# OPEANAI, if you switch NEXT_PUBLIC_CHAT_AI_API to "openai"
export OPENAI_API_KEY="..."

# SUPABASE, used to store file content after it's read once: https://supabase.com/
export NEXT_PUBLIC_SUPABASE_URL="..."
export NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# DROPBOX, used for the Dropbox Sign API features: https://developers.hellosign.com/api/reference/signature-request/
export DROPBOX_CLIENT_ID="..."
export DROPBOX_CLIENT_SECRET="..."
export DROPBOX_REDIRECT_URI="..."

# SQUARE, used for the Square API features: https://developer.squareup.com/explorer/square
export SQUARE_APP_ID="..."
export SQUARE_APP_SECRET="..."
export SQUARE_ACCESS_TOKEN="..."
export SQUARE_OAUTH_ENDPOINT="..."

# GOOGLE, used for googleai authentication: https://cloud.google.com/docs/authentication/provide-credentials-adc
export GOOGLE_APPLICATION_CREDENTIALS="path to credentials"
export GOOGLE_PROJECT_ID="..."

# DATABASE, used for the Supabase postgres instance
export POSTGRES_DB_NAME=postgres
export POSTGRES_DB_USERNAME=postgres
export POSTGRES_DB_PASSWORD=...
export POSTGRES_DB_HOST=...
export POSTGRES_DB_PORT=5432
```

<a name="debugging"/>

### Optional VSCode debugging

Instead of `yarn dev:debug`, hit the `F5` key, it should launch the VSCode Debugger in a new terminal session. You may create debug breakpoints on API endpoints, for example.

<a name="contributing"/>

## Contributing

Check the paid issues in the [AI File Agent project board](https://github.com/orgs/aufacicenta/projects/3/views/1)!