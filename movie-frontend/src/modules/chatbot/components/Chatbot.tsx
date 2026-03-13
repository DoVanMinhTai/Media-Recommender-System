import { useEffect, useRef, useState } from "react";
import { sendMessage } from "../service/ChatBotService";
import type { MovieThumbnailVm } from "../../moviedetail/model/MovieThumbnailVm";
import { MovieCard } from "./MovieCard";

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, role: 'bot', text: 'Xin chào! Bạn muốn tìm phim gì hôm nay?', movies: [] as MovieThumbnailVm[] },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const accumulatedTextRef = useRef("");
    const currentMoviesRef = useRef<MovieThumbnailVm[]>([]);
    const lastUpdateRef = useRef(0);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages])
    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), role: 'user', text: input, movies: [] as MovieThumbnailVm[] };
        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput("");
        setIsTyping(true);

        const botMsgId = Date.now() + 1;
        setMessages(prev => [...prev, { id: botMsgId, role: 'bot', text: "", movies: [] as MovieThumbnailVm[] }]);

        try {
            const response = await sendMessage(currentInput)

            if (!response.ok) throw new Error("Network response was not ok");
            if (!response.body) throw new Error("ReadableStream not supported");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { value, done } = await reader.read();
                console.log("Reader read - done:", done, "value:", value);

                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    console.log("Dữ liệu thô nhận được:", chunk);
                }
                if (done) {
                    console.log("Stream finished");
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n");

                for (const line of lines) {
                    let textToParse = line.trim();

                    if (textToParse.startsWith("data:")) {
                        textToParse = textToParse.replace("data:", "").trim();
                    }

                    if (!textToParse) continue;

                    try {
                        const parsed = JSON.parse(textToParse);

                        let content = parsed.message || "";
                        if (content.includes("Trình bày:") || content.includes("Trả lời:")) {
                            const parts = content.split(/Trình bày:|Trả lời:/);
                            content = parts[parts.length - 1].trim();
                        }

                        accumulatedTextRef.current = content;
                        if (parsed.data) {
                            currentMoviesRef.current = parsed.data;
                        }

                        const now = Date.now();
                        if (now - lastUpdateRef.current > 80) {
                            updateUI(botMsgId);
                            lastUpdateRef.current = now;
                        }
                    } catch (e) {
                        console.error("Lỗi parse JSON tại dòng:", textToParse, e);
                    }
                }
                updateUI(botMsgId);
            }
        } catch (error) {
            console.error("Streaming error:", error);
        } finally {
            setIsTyping(false);
        }
    };

    const updateUI = (botMsgId: number) => {
        setMessages(prev => {
            const index = prev.findIndex(m => m.id === botMsgId);
            if (index === -1) return prev;

            const newMessages = [...prev];
            newMessages[index] = {
                ...newMessages[index],
                text: accumulatedTextRef.current,
                movies: currentMoviesRef.current
            };
            return newMessages;
        });
    };

    return (
        <div className="fixed bottom-5 right-5 z-[1000] font-sans">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-nfRed text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition"
                    title="Chatbot"
                >
                    💬
                </button>
            ) : (
                <div className="w-[380px] h-[550px] bg-[#141414]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
                    <div className="p-4 flex justify-between items-center border-b border-white/10 bg-black/20">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-white font-medium">AI Assistant</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-nfGrey-10 hover:text-white">✕</button>
                    </div>

                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed ${msg.role === 'user'
                                    ? 'bg-[#E50914] text-white rounded-tr-none'
                                    : 'bg-[#2F2F2F] text-gray-100 border border-white/5 rounded-tl-none'
                                    }`}>
                                    {msg.text}

                                    {msg.movies && msg.movies.length > 0 && (
                                        <>
                                            {msg.movies.map((movie) => (
                                                <MovieCard key={movie.id} movie={movie} />
                                            ))}
                                        </>
                                    )}

                                    {isTyping && msg.id === messages[messages.length - 1].id && msg.role === 'bot' && !msg.text && (
                                        <div className="flex gap-1 py-2">
                                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-3 bg-nfGrey-800 space-y-3">
                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                            {['Phim hành động', 'Top 10 hôm nay', 'Phim mới'].map((txt) => (
                                <button key={txt} className="whitespace-nowrap px-3 py-1 bg-black border border-nfGrey-400 rounded-full text-[11px] text-nfGrey-10 hover:border-white transition">
                                    {txt}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Hỏi AI về phim..."
                                className="w-full bg-[#2b2b2b] text-white text-sm rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:ring-1 focus:ring-[#E50914] transition"
                            />
                            <button onClick={handleSend}
                                className="text-nfRed font-bold px-2">Gửi</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}