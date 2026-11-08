import { createFileRoute } from "@tanstack/react-router";

import { ChatPage } from "../components/pages/Chat";

export const Route = createFileRoute("/")({ component: ChatPage });
