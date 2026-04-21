import apiClientService from "../../../common/services/ApiClientService";

export const adminService = {
    getStats: () => apiClientService.get('/admin/statistics').then(res => res.data),
    getMovies: () => apiClientService.get('/admin/movie/movies').then(res => res.data),
    deleteMovie: (id: number, adminPass: string) => apiClientService.delete(`/admin/movie/${id}`, {
        headers: { 'X-Admin-Password': adminPass }
    }),
    addMovie: (movie: any, adminPass: string) => apiClientService.post('/admin/movie/addMovie', movie, {
        headers: { 'X-Admin-Password': adminPass }
    }),
    updateMovie: (movie: any, adminPass: string) => apiClientService.put('/admin/movie/putMovie', movie, {
        headers: { 'X-Admin-Password': adminPass }
    }),
    getUsers: () => apiClientService.get('/admin/movie/users').then(res => res.data),
    deleteUser: (id: number) => apiClientService.delete(`/admin/movie/users/${id}`),
};
