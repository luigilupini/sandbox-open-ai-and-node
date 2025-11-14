const colorMap = {
	green: "\x1b[32m",
	cyan: "\x1b[36m",
	yellow: "\x1b[33m",
	red: "\x1b[31m",
	blue: "\x1b[34m",
	pink: "\x1b[1;35m",
	white: "\x1b[37m",
};

export const sysLog = (label, message, color = "green") => {
	const colorCode = colorMap[color] || colorMap.green;
	console.log(`${colorCode}[${label}] ${message}\x1b[0m`);
};
