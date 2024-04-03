import Container from "./Container";

const Dashboard = () => {
  return (
    <div className="w-full min-h-full p-4 border-b-2 border-t-2 border-t-white border-b-cyan-100 shadow-lg  mb-8 h-80 min-h-72">
      <div className="w-full h-full flex flex-row gap-5">
        <Container />
      </div>
    </div>
  );
};

export default Dashboard;
