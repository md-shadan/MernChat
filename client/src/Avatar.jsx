export default function Avatar({username,userId}){
    const colors = ['bg-blue-200','bg-teal-200' , 'bg-green-200' , 'bg-purple-200' , 'bg-red-200' ,'bg-cyan-200' ];
    const userIdBase10 = parseInt(userId,16);
    const colorIndex = userIdBase10 % colors.length;
    const color = colors[colorIndex];
    // console.log(color);
    return(
        <div className={"w-8 h-8  rounded-full flex justify-center items-center opacity-70 " + color}>
            {username[0]}
        </div>
    )
}