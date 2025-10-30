export default function getToken() {
    if(typeof window !== 'undefined') {
        return localStorage.getItem('token')
    }
}