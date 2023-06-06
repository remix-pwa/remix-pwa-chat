import { redirect, type LoaderFunction } from "@remix-run/node";
import { useLoaderData, useLocation } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import Talk from "talkjs";
import { decrypytConversationId } from "~/utils/idGeneration";
import { getUserId } from "~/utils/server/session.server";

export const loader: LoaderFunction = async ({ params, request }) => {
  const slug = params.slug;
  const userId = await getUserId(request);

  if (!slug) {
    return redirect("/chat");
  }

  return userId;
}

export default () => {
  const chatboxEl = useRef(null!);
  const location = useLocation();
  const loaderData = useLoaderData<string>();

  // wait for TalkJS to load
  const [talkLoaded, markTalkLoaded] = useState(false);

  useEffect(() => {
    Talk.ready.then(() => markTalkLoaded(true));

    if (talkLoaded) {
      const currentUser = new Talk.User(loaderData);
      const [firstId, secondId] = decrypytConversationId(location.pathname.split("/")[2]);
      const otherUser = new Talk.User(firstId === loaderData ? secondId : firstId);

      const session = new Talk.Session({
        appId: 'YOUR_APP_ID',
        me: currentUser,
      });

      const conversation = session.getOrCreateConversation(location.pathname.split("/")[2]);
      conversation.setParticipant(currentUser);
      conversation.setParticipant(otherUser);

      const chatbox = session.createChatbox();
      chatbox.select(conversation);
      chatbox.mount(chatboxEl.current);

      if (location.pathname === '/chat') {
        chatbox.destroy();
      }

      return () => session.destroy();
    }
  }, [talkLoaded, location]);

  return <div ref={chatboxEl} className="w-full h-full" />;
}