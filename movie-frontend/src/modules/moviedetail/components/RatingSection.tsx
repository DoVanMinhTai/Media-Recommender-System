import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Star, Lock, CheckCircle2 } from "lucide-react";

export const RatingSection = ({ mediaId }: { mediaId: number }) => {
    const [hover, setHover] = useState(0);
    const [rating, setRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasWatched, setHasWatched] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkWatchedStatus = async () => {
            try {
                const response = await fetch(`http://localhost:8080/user/api/hasWatched/${mediaId}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
                });
                const data = await response.json();
                setHasWatched(data.watched);
            } catch (error) {
                setHasWatched(false);
            } finally {
                setIsLoading(false);
            }
        };
        checkWatchedStatus();
    }, [mediaId]);

    const handleRate = async (score: number) => {
        if (!hasWatched) {
            toast.error("Bạn cần xem phim trước khi để lại đánh giá!");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch("http://localhost:8080/user/api/rateMovie", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    movieId: mediaId,
                    score: score,
                    comment: ""
                })
            });

            if (response.ok) {
                setRating(score);
                toast.success(`Tuyệt vời! ${score} sao đã được ghi nhận.`);
            } else {
                toast.error("Gửi đánh giá thất bại.");
            }
        } catch (error) {
            toast.error("Lỗi kết nối server.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="animate-pulse h-32 bg-white/5 rounded-lg mt-10" />;

    return (
        <div className="container mx-auto  mb-8">
            <div className={`relative overflow-hidden p-8 rounded-2xl border transition-all duration-500 w-full max-w-2xl mt-12 ${hasWatched
                ? "bg-gradient-to-br from-zinc-900/90 to-black border-zinc-800 shadow-2xl"
                : "bg-zinc-900/40 border-zinc-800/50 backdrop-blur-sm"
                }`}>

                <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-xl font-medium text-white tracking-tight">
                            Đánh giá trải nghiệm
                        </h3>
                        {hasWatched ? (
                            <span className="flex items-center gap-1 text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full border border-green-500/20">
                                <CheckCircle2 size={12} /> Đã xem
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20">
                                <Lock size={12} /> Chưa xem
                            </span>
                        )}
                    </div>

                    {!hasWatched ? (
                        <div className="py-4">
                            <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
                                Tính năng đánh giá chỉ dành cho những người đã thưởng thức bộ phim này.
                                Hãy xem phim để mở khóa và giúp AI hiểu gu của bạn hơn nhé!
                            </p>
                            <button className="mt-6 px-6 py-2 bg-white text-black font-bold rounded-md text-sm hover:bg-zinc-200 transition">
                                Xem phim ngay
                            </button>
                        </div>
                    ) : (
                        <>
                            <p className="text-zinc-500 text-sm mb-6">
                                Đánh giá của bạn giúp chúng tôi gợi ý những bộ phim phù hợp hơn.
                            </p>

                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        disabled={isSubmitting}
                                        className="relative group p-1 outline-none"
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(0)}
                                        onClick={() => handleRate(star)}
                                    >
                                        <Star
                                            size={42}
                                            strokeWidth={1.5}
                                            className={`transition-all duration-300 transform ${star <= (hover || rating)
                                                ? "fill-yellow-400 text-yellow-400 scale-110 drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]"
                                                : "text-zinc-600 group-hover:text-zinc-400"
                                                } ${isSubmitting ? "animate-pulse" : "active:scale-90"}`}
                                        />
                                        <span className={`absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold transition-all ${hover === star ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                                            } text-yellow-500`}>
                                            {star}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-6 h-6">
                                <p className={`text-sm transition-all duration-500 ${rating > 0 ? "text-green-400 font-medium" : "text-zinc-500"}`}>
                                    {rating > 0
                                        ? "Cảm ơn! Hệ thống AI đang cập nhật sở thích của bạn..."
                                        : hover > 0 ? `Tặng ${hover} sao cho phim này?` : "Bạn thấy phim thế nào?"}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

        </div>
    );
};