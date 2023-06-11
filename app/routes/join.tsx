import { redirect, type ActionFunction, type LoaderFunction, json } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { db } from "~/utils/server/db.server";
import { createUserSession, getUserId, register } from "~/utils/server/session.server";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const name = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("pwd") as string;

  if (name.length > 0 && email.length > 0 && password.length > 0) {
    const userExists = await db.user.findFirst({
      where: { email },
    });

    if (userExists) {
      return json({ message: "User already exists" }, { status: 409 })
    }

    const user = await register({ name, email, password });

    if (user) {
      return createUserSession(user.id, "/chat");
    }
  }

  return json({ message: "Something went wrong" }, { status: 500 });
}

export const loader: LoaderFunction = async ({ request }) => {
  const userSessionActive = await getUserId(request);

  if (userSessionActive) {
    return redirect("/chat");
  }

  return null;
}

export default () => {
  return (
    <div className="relative py-16">
      <div className="container relative m-auto px-6 text-gray-500 md:px-12 xl:px-40">
        <div className="m-auto space-y-8 md:w-8/12 lg:w-6/12 xl:w-6/12">
          <img src="" loading="lazy" className="ml-4 w-36" alt="tailus logo" />
          <div className="rounded-3xl border border-gray-100 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-2xl shadow-gray-600/10 backdrop-blur-2xl">
            <div className="p-8 py-12 sm:p-16">
              <h2 className="mb-8 text-2xl font-bold text-gray-800 dark:text-white">Sign in to your account</h2>
              <form method="post" className="space-y-8">
                <div className="space-y-2">
                  <label htmlFor="username" className="text-gray-600 dark:text-gray-300">Username</label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    autoComplete="username"
                    className="focus:outline-none block w-full rounded-md border border-gray-200 dark:border-gray-600 bg-transparent px-4 py-3 text-gray-600 transition duration-300 invalid:ring-2 invalid:ring-red-400 focus:ring-2 focus:ring-cyan-300"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-gray-600 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    autoComplete="username"
                    className="focus:outline-none block w-full rounded-md border border-gray-200 dark:border-gray-600 bg-transparent px-4 py-3 text-gray-600 transition duration-300 invalid:ring-2 invalid:ring-red-400 focus:ring-2 focus:ring-cyan-300"
                  />
                </div>

                <div>
                  <label htmlFor="pwd" className="text-gray-600 dark:text-gray-300">Password</label>
                  <input
                    type="password"
                    name="pwd"
                    id="pwd"
                    autoComplete="current-password"
                    className="focus:outline-none block w-full rounded-md border border-gray-200 dark:border-gray-600 bg-transparent px-4 py-3 text-gray-600 transition duration-300 invalid:ring-2 invalid:ring-red-400 focus:ring-2 focus:ring-cyan-300"
                  />
                </div>

                <button type="submit" className="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:bg-primary before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95">
                  <span className="relative text-base font-semibold text-white dark:text-dark">Connect</span>
                </button>

                <p className="border-t border-gray-100 dark:border-gray-700 pt-6 text-sm text-gray-500 dark:text-gray-400">
                  Already have an account?&nbsp;
                  <Link to="/login" className="text-primary">Sign in</Link>
                </p>
              </form>
            </div>
          </div>
          <div className="space-x-4 text-center text-gray-500">
            <span>&copy; Remix Çhat</span>
            <Link to="#" className="text-sm hover:text-primary">Contact</Link>
            <Link to="#" className="text-sm hover:text-primary">Privacy & Terms</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
