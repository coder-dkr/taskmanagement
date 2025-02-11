export function debounce(func :any, delay : any) {
    let timer : any;
    return (...args : any) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
    };
}
