"use client";

import { signIn, signOut, useSession } from "next-auth/react";

const Authorization = () => {
  const { data: session } = useSession();

  return (
    <>
      {!session ? (
        <button onClick={() => signIn("google")}>Sign in with Google</button>
      ) : (
        <>
          <p>Signed in as {session.user.email}</p>
          <button onClick={() => signOut()}>Sign out</button>
        </>
      )}
    </>
  );
};

export default Authorization;
