export const toNum2 = (num: number | undefined | typeof NaN) => {
	return num !== undefined && !isNaN(num) ? num.toFixed(2) : ' ';
};
