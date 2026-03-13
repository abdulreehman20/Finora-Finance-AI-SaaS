// "use client";

// import {
//   IconArrowUp,
//   IconLoader2,
//   IconMessageChatbot,
//   IconPaperclip,
//   IconSparkles,
//   IconTrash,
// } from "@tabler/icons-react";
// import { useCallback, useEffect, useRef, useState } from "react";

// interface ChatMessage {
//   id: string;
//   role: "user" | "assistant";
//   content: string;
//   createdAt: Date;
// }

// const SUGGESTIONS = [
//   "Summarize my spending this month",
//   "What are my top expense categories?",
//   "How can I save more money?",
//   "Compare income vs expenses this quarter",
// ];

// export default function AIAssistantPage() {
//   const [messages, setMessages] = useState<ChatMessage[]>([
//     {
//       id: "welcome",
//       role: "assistant",
//       content:
//         "Hello! I'm your Finora AI assistant. I can help you analyze your spending, find transactions, or give you a summary of your reports. How can I help you today?",
//       createdAt: new Date(),
//     },
//   ]);
//   const [input, setInput] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLTextAreaElement>(null);

//   const scrollToBottom = useCallback(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, []);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, scrollToBottom]);

//   function generateId() {
//     return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
//   }

//   async function handleSubmit(e?: React.FormEvent) {
//     e?.preventDefault();
//     const trimmed = input.trim();
//     if (!trimmed || isLoading) return;

//     const userMsg: ChatMessage = {
//       id: generateId(),
//       role: "user",
//       content: trimmed,
//       createdAt: new Date(),
//     };

//     setMessages((prev) => [...prev, userMsg]);
//     setInput("");
//     setIsLoading(true);

//     // Simulate AI response (connect to real endpoint when available)
//     setTimeout(() => {
//       const aiMsg: ChatMessage = {
//         id: generateId(),
//         role: "assistant",
//         content: getSimulatedResponse(trimmed),
//         createdAt: new Date(),
//       };
//       setMessages((prev) => [...prev, aiMsg]);
//       setIsLoading(false);
//     }, 1200 + Math.random() * 800);
//   }

//   function getSimulatedResponse(query: string): string {
//     const lower = query.toLowerCase();
//     if (lower.includes("spend") || lower.includes("expense")) {
//       return "Based on your recent transactions, your top spending categories this month are:\n\n1. **Food & Dining** — $482.50\n2. **Transportation** — $245.00\n3. **Shopping** — $189.99\n4. **Utilities** — $156.00\n\nYour total expenses are approximately **$1,073.49**, which is 15% higher than last month. Consider reviewing your Food & Dining expenses for potential savings.";
//     }
//     if (lower.includes("save") || lower.includes("saving")) {
//       return "Here are some personalized savings tips based on your spending patterns:\n\n📊 **Reduce dining out** — You spent $482 on food this month. Cooking at home could save ~$200/month.\n\n🚗 **Optimize transport** — Consider carpooling or public transit to cut your $245 transportation costs.\n\n💡 **Set up automation** — Create a recurring transfer of 20% of your income to savings on payday.\n\nWith these changes, you could save approximately **$400-500** more per month!";
//     }
//     if (lower.includes("income") || lower.includes("revenue")) {
//       return "Your income overview:\n\n💰 **Total Income (this month):** $3,250.00\n📈 **vs Last Month:** +8.3%\n\nIncome sources:\n- Freelance: $2,000\n- Salary: $1,000\n- Investments: $250\n\nYour income is trending upward. Great job!";
//     }
//     if (lower.includes("compare") || lower.includes("quarter")) {
//       return "Here's your quarterly comparison:\n\n| Metric | This Quarter | Last Quarter | Change |\n|--------|-------------|-------------|--------|\n| Income | $9,750 | $8,900 | +9.6% |\n| Expenses | $7,200 | $6,800 | +5.9% |\n| Savings | $2,550 | $2,100 | +21.4% |\n\nYour savings rate has improved from 23.6% to 26.2%. Keep it up! 🎉";
//     }
//     return `I understand you're asking about "${query}". Let me analyze your financial data...\n\nBased on your recent transaction history, here are my insights:\n\n• Your overall financial health looks stable\n• I recommend reviewing your recurring expenses for optimization opportunities\n• Consider setting up budget alerts for categories where you tend to overspend\n\nWould you like me to dive deeper into any specific area?`;
//   }

//   function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSubmit();
//     }
//   }

//   function clearChat() {
//     setMessages([
//       {
//         id: "welcome",
//         role: "assistant",
//         content:
//           "Hello! I'm your Finora AI assistant. How can I help you today?",
//         createdAt: new Date(),
//       },
//     ]);
//   }

//   return (
//     <main className="flex h-[calc(100vh-64px)] flex-col bg-[oklch(0.06_0.01_145)]">
//       {/* ── Header Bar ── */}
//       <div className="flex items-center justify-between border-b border-white/10 px-6 py-3">
//         <div className="flex items-center gap-3">
//           <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30">
//             <IconSparkles size={18} />
//           </div>
//           <div>
//             <h1 className="text-base font-semibold text-white">
//               Finora AI
//             </h1>
//             <p className="text-[11px] text-zinc-500">Financial Assistant</p>
//           </div>
//         </div>
//         <button
//           type="button"
//           onClick={clearChat}
//           className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-zinc-300 transition-all"
//           title="Clear chat"
//         >
//           <IconTrash size={16} />
//         </button>
//       </div>

//       {/* ── Messages Area ── */}
//       <div className="flex-1 overflow-y-auto">
//         <div className="mx-auto max-w-3xl px-6 py-6 space-y-6">
//           {messages.map((msg) => (
//             <div
//               key={msg.id}
//               className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
//             >
//               {msg.role === "assistant" && (
//                 <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white mt-1 shadow-lg shadow-green-500/20">
//                   <IconSparkles size={14} />
//                 </div>
//               )}
//               <div
//                 className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
//                   msg.role === "user"
//                     ? "bg-green-500 text-white rounded-br-md"
//                     : "bg-white/5 text-zinc-300 border border-white/5 rounded-bl-md"
//                 }`}
//               >
//                 {msg.content.split("\n").map((line, i) => (
//                   <span key={i}>
//                     {line
//                       .replace(
//                         /\*\*(.*?)\*\*/g,
//                         '<strong class="text-white font-semibold">$1</strong>',
//                       )
//                       .includes("<strong") ? (
//                       <span
//                         dangerouslySetInnerHTML={{
//                           __html: line.replace(
//                             /\*\*(.*?)\*\*/g,
//                             '<strong class="text-white font-semibold">$1</strong>',
//                           ),
//                         }}
//                       />
//                     ) : (
//                       line
//                     )}
//                     {i < msg.content.split("\n").length - 1 && <br />}
//                   </span>
//                 ))}
//               </div>
//               {msg.role === "user" && (
//                 <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-700 text-white mt-1">
//                   <IconMessageChatbot size={14} />
//                 </div>
//               )}
//             </div>
//           ))}

//           {/* Loading indicator */}
//           {isLoading && (
//             <div className="flex gap-3">
//               <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white mt-1">
//                 <IconSparkles size={14} />
//               </div>
//               <div className="rounded-2xl rounded-bl-md bg-white/5 border border-white/5 px-4 py-3">
//                 <div className="flex items-center gap-2 text-sm text-zinc-400">
//                   <IconLoader2 size={14} className="animate-spin" />
//                   Thinking...
//                 </div>
//               </div>
//             </div>
//           )}

//           <div ref={messagesEndRef} />
//         </div>
//       </div>

//       {/* ── Suggestions (shown when few messages) ── */}
//       {messages.length <= 1 && (
//         <div className="mx-auto max-w-3xl px-6 pb-3 w-full">
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//             {SUGGESTIONS.map((suggestion) => (
//               <button
//                 key={suggestion}
//                 type="button"
//                 onClick={() => {
//                   setInput(suggestion);
//                   setTimeout(() => inputRef.current?.focus(), 50);
//                 }}
//                 className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-zinc-400 hover:bg-white/10 hover:text-zinc-200 hover:border-white/20 transition-all"
//               >
//                 {suggestion}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* ── Input Area ── */}
//       <div className="border-t border-white/10 bg-[oklch(0.06_0.01_145)]">
//         <div className="mx-auto max-w-3xl px-6 py-4">
//           <form onSubmit={handleSubmit} className="relative">
//             <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 focus-within:border-green-500/40 focus-within:ring-1 focus-within:ring-green-500/20 transition-all">
//               <button
//                 type="button"
//                 className="rounded-lg p-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all shrink-0"
//                 title="Attach file"
//               >
//                 <IconPaperclip size={18} />
//               </button>
//               <textarea
//                 ref={inputRef}
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 onKeyDown={handleKeyDown}
//                 placeholder="Message Finora AI..."
//                 rows={1}
//                 className="flex-1 resize-none bg-transparent py-2 text-sm text-white placeholder-zinc-500 outline-none min-h-[40px] max-h-[200px]"
//                 style={{ height: "auto" }}
//                 onInput={(e) => {
//                   const target = e.target as HTMLTextAreaElement;
//                   target.style.height = "auto";
//                   target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
//                 }}
//               />
//               <button
//                 type="submit"
//                 disabled={!input.trim() || isLoading}
//                 className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/20"
//               >
//                 {isLoading ? (
//                   <IconLoader2 size={16} className="animate-spin" />
//                 ) : (
//                   <IconArrowUp size={16} />
//                 )}
//               </button>
//             </div>
//           </form>
//           <p className="mt-2 text-center text-[10px] text-zinc-600">
//             Finora AI can make mistakes. Consider checking important financial
//             data.
//           </p>
//         </div>
//       </div>
//     </main>
//   );
// }
