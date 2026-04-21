import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../../modules/admin/service/AdminService";
import toast from "react-hot-toast";
import { useState } from "react";
import { Trash2, Edit3, Plus, Key, X, AlertTriangle, Search } from "lucide-react";
import ImageFallback from "../../common/components/ImageFallback";

const AdminPasswordModal = ({ isOpen, onClose, onConfirm, title, loading }: any) => {
    const [password, setPassword] = useState("");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <Key size={20} className="text-red-500" />
                        </div>
                        <h3 className="font-bold text-white text-lg">{title}</h3>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-8">
                    <div className="flex items-center gap-3 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl mb-6">
                        <AlertTriangle size={24} className="text-yellow-600 flex-shrink-0" />
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                            Thao tác này sẽ thay đổi trực tiếp dữ liệu trong Database. Vui lòng nhập mật khẩu Admin để xác nhận.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Mật khẩu xác thực</label>
                            <input
                                type="password"
                                autoFocus
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-red-600 transition-all placeholder:text-zinc-700"
                                placeholder="Nhập admin password..."
                                onKeyDown={(e) => e.key === 'Enter' && onConfirm(password)}
                            />
                        </div>
                        
                        <button
                            onClick={() => onConfirm(password)}
                            disabled={loading || !password}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-red-900/20"
                        >
                            {loading ? "Đang xác thực..." : "XÁC NHẬN THỰC THI"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function MovieManage() {
  const queryClient = useQueryClient();
  const [modalState, setModalState] = useState<{isOpen: boolean, movieId: number | null}>({
    isOpen: false,
    movieId: null
  });

  const { data: movies, isLoading, isError } = useQuery({
    queryKey: ['admin-movies'],
    queryFn: adminService.getMovies,
  });

  console.log("Movies data:", movies); // Debug log to check the structure of movies data 

  const deleteMutation = useMutation({
    mutationFn: ({id, pass}: {id: number, pass: string}) => adminService.deleteMovie(id, pass),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
      toast.success("Đã xóa phim thành công!");
      setModalState({ isOpen: false, movieId: null });
    },
    onError: (error: any) => {
      const msg = error.response?.data || "Có lỗi xảy ra khi xóa phim.";
      toast.error(msg);
    }
  });

  const handleDeleteConfirm = (password: string) => {
    if (modalState.movieId) {
      deleteMutation.mutate({ id: modalState.movieId, pass: password });
    }
  };

  if (isLoading) return (
    <div className="p-12 space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-zinc-800 rounded-md"></div>
        <div className="h-64 bg-zinc-900 rounded-2xl"></div>
    </div>
  );
  
  if (isError) return (
    <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 bg-red-500/10 rounded-full text-red-500">
            <AlertTriangle size={48} />
        </div>
        <h2 className="text-xl font-bold">Không thể kết nối Server</h2>
        <p className="text-zinc-500 text-sm max-w-xs">Hãy kiểm tra lại quyền Admin hoặc trạng thái của Backend Service.</p>
    </div>
  );

  return (
    <div className="p-6 md:p-10 bg-[#0a0a0a] min-h-screen text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">Movie Library</h2>
            <p className="text-zinc-500 text-sm mt-1">Quản lý cơ sở dữ liệu phim và nội dung đa phương tiện</p>
        </div>
        <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-900/20 hover:-translate-y-0.5 active:scale-95">
          <Plus size={20} />
          THÊM PHIM MỚI
        </button>
      </div>

      <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-800/30 text-zinc-500 text-[11px] font-black uppercase tracking-widest">
              <th className="px-6 py-5">Thông tin phim</th>
              <th className="px-6 py-5 hidden md:table-cell">ID</th>
              <th className="px-6 py-5 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {Array.isArray(movies) && movies.length > 0 ? (
              movies.map((item: any) => (
                <tr key={item.id} className="hover:bg-zinc-800/20 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div className="relative w-16 h-24 flex-shrink-0">
                            <ImageFallback 
                                src={item.backdropPath ? `https://image.tmdb.org/t/p/w200${item.backdropPath}` : "/image_fallback.png"} 
                                className="w-full h-full object-cover rounded-lg shadow-xl border border-zinc-800 group-hover:border-zinc-700 transition-colors" 
                                alt={item.title}
                            />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-bold text-zinc-100 group-hover:text-red-500 transition-colors line-clamp-1">{item.title}</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-bold uppercase">Original</span>
                                <span className="text-xs text-zinc-600">v1.2.4</span>
                            </div>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-zinc-600 font-mono text-xs">#{item.id}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <button className="flex items-center gap-1 text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-tight">
                        <Edit3 size={16} />
                        Sửa
                      </button>
                      <button 
                        onClick={() => setModalState({ isOpen: true, movieId: item.id })}
                        className="flex items-center gap-1 bg-red-500/10 text-red-500 px-3 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all text-xs font-bold uppercase tracking-tight"
                      >
                        <Trash2 size={16} />
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center text-zinc-600">
                    <Search size={48} className="mb-4 opacity-20" />
                    <p className="text-sm italic">Không tìm thấy phim nào trong thư viện.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AdminPasswordModal 
        isOpen={modalState.isOpen}
        title="Xác thực Xóa Phim"
        loading={deleteMutation.isPending}
        onClose={() => setModalState({ isOpen: false, movieId: null })}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
