export default function Avatar({ username, userId ,online}) {
  const colors = [
    "bg-blue-200",
    "bg-teal-200",
    "bg-green-200",
    "bg-purple-200",
    "bg-red-200",
    "bg-cyan-200",
  ];
  const userIdBase10 = parseInt(userId, 16);
  const colorIndex = userIdBase10 % colors.length;
  const color = colors[colorIndex];
  // console.log(color);
  return (
    <div
      className={"w-10 h-10 rounded-full flex items-center relative " + color}
    >
      <div className="text-center w-full opacity-80">
        {username[0]}
      </div>
      {online && (
        <div className="absolute w-3 h-3 bg-green-400 rounded-full right-0 bottom-0 border border-white shadow-sm shadow-black"></div>
      )}
      {!online && (
        <div className="absolute w-3 h-3 bg-gray-400 rounded-full right-0 bottom-0 border border-white shadow-sm shadow-black"></div>
      )}
    </div>
  );
}
