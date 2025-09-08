import AuthForm from "../components/auth/AuthForm";

function Auth() {
  return (
    <main className="py-10 h-screen space-y-5 overflow-y-auto bg-[#008080]">
      <div className="max-w-lg mx-auto bg-[#C0C0C0] round-md p-1 space-y-2 shadow-w95Container">
        <div className="max-w-lg mx-auto bg-[#000080] text-white px-2 py-1">Register or Login</div>
        <div className="max-w-lg mx-auto shadow-w95InnerContainer p-3">
          <AuthForm />
        </div>
      </div>
    </main>
  );
}

export default Auth;
