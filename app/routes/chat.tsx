import { Transition, Dialog, Combobox } from "@headlessui/react";
import { redirect, type LoaderFunction, json } from "@remix-run/node";
import { Outlet, useFetcher, useLoaderData, useLocation, useNavigate } from "@remix-run/react";
import { Fragment, useEffect, useState } from "react";
import Talk from "talkjs";
import { generateConversationId } from "~/utils/idGeneration";
import { db } from "~/utils/server/db.server";
import { getUser, logout } from "~/utils/server/session.server";

import type { User } from "@prisma/client";
import type { ActionFunction } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const userId = formData.get("userId") as string;
  const appId = process.env.TALKJS_APP_ID;

  const conversations = await fetch(`https://api.talkjs.com/v1/${appId}/users/${userId}/conversations`, {
    headers: {
      Authorization: `Bearer ${process.env.TALKJS_SECRET_KEY}`,
    }
  }).then(res => res.json());

  const conversationId = formData.get("conversationId") as string;

  if (conversationId) {
    return redirect(`/chat/${conversationId}`);
  }

  return { data: conversations.data };
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  const appId = process.env.TALKJS_APP_ID;

  if (user) {
    const conversations = await fetch(`https://api.talkjs.com/v1/${appId}/users/${user.id}/conversations`, {
      headers: {
        Authorization: `Bearer ${process.env.TALKJS_SECRET_KEY}`,
        "Content-Type": "application/json"
      }
    }).then(res => res.json());

    const allUsers = await db.user.findMany({
      select: {
        id: true,
        name: true,
        avatar: true,
      },
      // we want to avoid sending ourselves back to the client
      where: {
        id: {
          not: user.id
        }
      }
    })

    const data = conversations.
      data
      .map((conversation: any) => {
        const otherUser = Object.keys(conversation.participants).map((key) => {
          return allUsers.find((user) => user.id === key)
        }).filter((user) => user !== undefined)[0];

        return {
          otherUser: {
            id: otherUser?.id,
            name: allUsers.find((user) => user.id === otherUser?.id)?.name,
            avatar: allUsers.find((user) => user.id === otherUser?.id)?.avatar,
          },
          welcomeMessages: conversation.welcomeMessages,
          lastMessage: conversation.lastMessage,
          conversationId: conversation.id,
          createdAt: conversation.createdAt
        }
      })

    return json({ user, conversations: data, users: allUsers }, { status: 200 });
  }



  return logout(request);
}

type UserExcerpt = {
  id: string;
  name: string;
  avatar: string;
}

type LoaderData = {
  user: User,
  conversations: {
    otherUser: UserExcerpt,
    welcomeMessages: any,
    lastMessage: any | null,
    conversationId: string,
    createdAt: number
  }[],
  users: UserExcerpt[]
}

export default () => {
  const loaderData = useLoaderData<LoaderData>();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const location = useLocation();

  const [chatLoaded, setChatLoaded] = useState(false);
  const [conversations, setConversations] = useState<any[] | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [allUsers, setAllUsers] = useState<any[]>([])

  const [query, setQuery] = useState('')

  const [open, setOpen] = useState(false)

  const filteredPeople =
    query === ''
      ? []
      : allUsers.filter((user) => {
        return user.name.toLowerCase().includes(query.toLowerCase())
      })

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
  }

  useEffect(() => {
    if (location.pathname.includes("chat")) {
      const conversationId = location.pathname.split("/")[2];

      if (conversationId) {
        const conversation = conversations?.find((conversation) => conversation.conversationId === conversationId);

        if (conversation) {
          setSelectedConversation(conversation);
        } else {
          setSelectedConversation(null);
        }
      } else {
        setSelectedConversation(null);
      }

      setConversations(loaderData.conversations)
      setAllUsers(loaderData.users)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, location])

  useEffect(() => {
    Talk.ready.then(() => setChatLoaded(true));

    if (chatLoaded) {
      // synchronize the user with TalkJS. Creates a new user if one doesn't exist.
      new Talk.User({
        id: loaderData.user.id,
        name: loaderData.user.name,
        email: loaderData.user.email,
        photoUrl: loaderData.user.avatar,
        welcomeMessage: null,
        role: "default",
      });
    }

    setConversations(loaderData.conversations)
    setAllUsers(loaderData.users)
  }, [chatLoaded, loaderData]);

  return (
    <div className="flex flex-row overflow-hidden h-full">
      <Transition.Root show={open} as={Fragment} afterLeave={() => setQuery('')}>
        <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-800 dark:bg-gray-500 dark:bg-opacity-25 bg-opacity-25 transition-opacity" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Combobox
              as="div"
              className="mx-auto max-w-xl transform divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 shadow-2xl ring-1 ring-blue-950 ring-opacity-5 transition-all"
              onChange={(person) => { }}
            >
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <Combobox.Input
                  className="h-12 w-full border-0 bg-transparent outline-none pl-11 pr-4 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-300 focus:ring-0"
                  placeholder="Search..."
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>

              {filteredPeople.length > 0 && (
                <Combobox.Options static className="max-h-72 scroll-py-2 overflow-y-auto py-2 text-sm text-gray-800">
                  {filteredPeople.map((person) => (
                    <Combobox.Option
                      key={person.id}
                      value={person}
                      onClick={() => {
                        fetcher.submit({ userId: loaderData.user.id, participantId: person.id, conversationId: generateConversationId(loaderData.user.id, person.id) }, { method: "POST" })
                        setOpen(false)
                      }}
                      className={({ active }) =>
                        classNames('cursor-default select-none flex px-4 py-2', active ? 'bg-primary text-white' : 'text-gray-900 dark:text-gray-200')
                      }
                    >
                      <img src={person.avatar} loading="eager" alt={person.name} className="h-6 w-6 flex-shrink-0 rounded-full" />
                      <span className='ml-3 truncate'>{person.name}</span>
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              )}

              {query !== '' && filteredPeople.length === 0 && (
                <p className="p-4 text-sm text-gray-500 dark:text-gray-400">No people found.</p>
              )}
            </Combobox>
          </Transition.Child>
        </Dialog>
      </Transition.Root>
      <aside
        className={`z-10 ${location.pathname == '/chat' ? 'flex' : 'hidden md:flex'} h-screen w-full flex-col justify-between border-r bg-[#ececec] transition duration-300 md:w-2/5 lg:w-96 dark:bg-gray-800 dark:border-gray-700`}
      >
        <nav className="border-b border-gray-200 dark:border-gray-700 py-4 h-16 text-xl text-gray-900 dark:text-gray-200 px-6 items-center flex justify-between">
          <span>Remix Chat</span>
          <svg xmlns="http://www.w3.org/2000/svg" onClick={() => { setOpen(true) }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 cursor-pointer">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </nav>
        {conversations ? (
          conversations.length == 0 ? (
            <div className="flex-1 flex justify-center items-center content-center flex-col bg-white">
              <img src="/images/mail.png" alt="No message" className="w-1/2 h-auto mb-2" />
              <span className="text-gray-900 dark:text-gray-200 text-lg">No conversations yet!</span>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700 items-center bg-white flex-1 overflow-auto">
              {loaderData.conversations.map((person) => (
                <li
                  key={person.otherUser.id} onClick={() => {
                    setSelectedConversation(person);
                    navigate(`/chat/${person.conversationId}`)
                  }}
                  className={`py-4 px-4 flex cursor-pointer dark:hover:bg-gray-500/50 ${(selectedConversation && selectedConversation.otherUser.id == person.otherUser.id) ? "dark:bg-gray-400/80" : ""}`}
                >
                  <img className="h-10 w-10 rounded-full" src={person.otherUser.avatar} alt="" />
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${person == selectedConversation ? "dark:text-gray-100 text-gray-800" : "text-gray-900 dark:text-gray-200"}`}>{person.otherUser.name}</p>
                    <p className={`text-sm ${selectedConversation == person ? "dark:text-gray-300 text-gray-400" : "dark:text-gray-400 text-gray-500 "}`}>{person.lastMessage ? person.lastMessage.text : "Hi there 👋! Let's chat"}</p>
                  </div>
                </li>
              ))}
            </ul>
          )) : (
          <div className="animate-spin bg-white inline-block w-8 h-8 mx-auto border-4 border-current border-t-transparent text-gray-400 rounded-full" role="status" aria-label="loading">
            <span className="sr-only">Loading...</span>
          </div>
        )}

        <div className="flex items-center justify-between border-t px-6 pt-4 h-[84px] dark:border-gray-700">
          <button className="group flex items-center space-x-4 rounded-md px-4 py-2 text-gray-600 dark:text-gray-300" onClick={() => {
            navigate('/logout')
          }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="group-hover:text-gray-700 dark:group-hover:text-white">Logout</span>
          </button>
        </div>
      </aside>
      <div className={`ml-auto ${location.pathname == '/chat' ? 'hidden' : 'block'} h-full md:block flex-1`}>
        <Outlet />
      </div>
    </div>
  );
}