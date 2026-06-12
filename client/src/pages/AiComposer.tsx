import { useEffect, useMemo, useState } from "react";
import { PLATFORMS } from "../assets/assets";
import {
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  HistoryIcon,
  ImageIcon,
  Loader2Icon,
  TimerIcon,
  WandIcon,
  XIcon,
} from "lucide-react";
import api from "../api/axios";
import { toast } from "react-toastify";

const AiComposer = () => {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Professional");
  const [loading, setLoading] = useState(false);
  const [generations, setGenerations] = useState<any[]>([]);
  const [activeScheduler, setActiveScheduler] = useState<any>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [scheduling, setScheduling] = useState(false);
  const mediaPreviewUrl = useMemo(
    () => (mediaFile ? URL.createObjectURL(mediaFile) : ""),
    [mediaFile],
  );
  const tones = ["Professional", "Creative", "Funny", "Minimalist", "Excited"];
  const fetchGenerations = async () => {
    try {
      const {data} = await api.get("/api/posts/generation")
      setGenerations(data)
    } catch (error:any) {
      toast.error(error?.response?.data?.message || error.message)
    }
  };
  useEffect(() => {
    fetchGenerations();
  }, []);
  useEffect(() => {
    return () => {
      if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
    };
  }, [mediaPreviewUrl]);
  const handleGenerate = async () => {
    if(!prompt){
      toast.warning("Please enter a prompt")
      return;
    }
    setLoading(true)
    try {
      const {data} = await api.post('/api/posts/generate',{prompt,tone})
      setGenerations([data,...generations])
      setActiveScheduler(data)
      toast.success("content generated")
    } catch (error:any) {
      toast.error(error?.response?.data?.message || error.message)
    }finally{
      setLoading(false)
    }
  };
  const handleSchedule = async()=> {
     if(!activeScheduler) return
     if(selectedPlatforms.length === 0){
      toast.warning("Selected at least one plateform")
      return;
     }
     if(!scheduledDate || !scheduledTime){
      toast.warning("Select date and time")
      return;
     }
     if(selectedPlatforms.includes("instagram") && !mediaFile && !activeScheduler.mediaUrl){
      toast.warning("Instagram requires an image or video")
      return;
     }
     const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
     const formData = new FormData();
     formData.append("content",activeScheduler.content);
     formData.append("platforms",JSON.stringify(selectedPlatforms));
     formData.append("scheduledFor",scheduledFor);
     formData.append("status","scheduled");
     if(activeScheduler.mediaUrl) {
      formData.append("mediaUrl",activeScheduler.mediaUrl);
      if(activeScheduler.mediaType) formData.append("mediaType",activeScheduler.mediaType);
     }
     if(mediaFile) formData.append("media",mediaFile);
     setScheduling(true)
       try {
         await api.post("/api/posts",formData,{headers:{"Content-Type":"multipart/form-data"}})
         toast.success("Ai Post scheduled")
         setActiveScheduler(null)
         setSelectedPlatforms([])
         setScheduledTime("")
         setScheduledDate("")
         setMediaFile(null)
         
        } catch (error:any) {
           toast.error(error?.response?.data?.message || error.message)
        }
        finally{
         setScheduling(false)
        }
  }
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      <div className="space-y-6 text-center mt-20">
        <h1 className="text-3xl text-slate-700 tracking-tight ">
          What should we create today ?
        </h1>
        <div className="relative group mt-12">
          <textarea
            placeholder="Share your idea...(e.g. A post about the launch of our new eco friendly coffee beans)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-6 py-6 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-slate-400 transition resize-none h-40 "
          />
          <div className="absolute bottom-4 right-2.5 flex items-center gap-3 text-sm">
            {mediaFile ? (
              <div className="flex items-center gap-2 bg-red-50 py-2 px-3 rounded-lg text-slate-600 max-w-48">
                <ImageIcon className="size-4 shrink-0 text-red-500" />
                <span className="truncate text-xs">{mediaFile.name}</span>
                <button
                  type="button"
                  onClick={() => setMediaFile(null)}
                  className="shrink-0 text-slate-400 hover:text-red-500"
                >
                  <XIcon className="size-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 bg-red-50 hover:bg-red-100 py-2 px-3 rounded-lg cursor-pointer text-slate-600 transition-colors">
                <ImageIcon className="size-4 text-red-500" />
                <span>Upload Media</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] && setMediaFile(e.target.files[0])
                  }
                />
              </label>
            )}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2 px-4 py-2 rounded-lg"
            >
              {loading ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  <span className="">Generating...</span>
                </>
              ) : (
                <>
                  Generate
                  <ArrowRightIcon className="size-4" />
                </>
              )}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {tones.map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all border ${tone === t ? "bg-red-500 border-red-500 text-white" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-6 pt-12 border-t border-slate-100">
        <div className="flex items-center justify-between text-slate-600">
          <div className="flex items-center gap-2">
            <HistoryIcon className="size-5" />
            <h2 className="text-xl">Recent Generation</h2>
          </div>
          <span className="text-sm text-slate-500 bg-slate-50 px-2">
            {generations.length} total
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {generations.map((gen) => (
            <div
              key={gen._id}
              className="group bg-white rounded-2xl border border-slate-100 p-5 hover:border-red-200 transition-all relative overflow-hidden"
            >
              <div className="flex flex-col h-full space-y-4">
                <div className="flex items-center justify-baseline">
                  <span className="text-xs text-slate-400 uppercase tracking-widest">
                    {new Date(gen.createdAt).toLocaleString()}
                  </span>
                  <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
                    {gen.tone}
                  </span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed flex-1">
                  {gen.content}
                </p>
                {gen.mediaUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-50 bg-slate-50">
                    <img
                      src={gen.mediaUrl}
                      alt="Gen"
                      className="w-full aspect-video object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setMediaFile(null);
                      setActiveScheduler(gen);
                    }}
                    className="flex-1 bg-slate-100 hover:bg-red-500 hover:text-white text-slate-600 text-xs py-2.5 rounded-lg transition-all"
                  >
                    Schedule Post
                  </button>
                </div>
              </div>
            </div>
          ))}
          {generations.length === 0 && (
            <div className="col-span-full py-20 text-center sapce-y-2">
              <div className="size-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                <WandIcon className="size-6" />
              </div>
              <p className="text-slate-400 text-sm">
                No content Generated yet using AI. Try generating some content
                using the AI
              </p>
            </div>
          )}
        </div>
      </div>
      {activeScheduler && (
        <div className="fixed inset-0 min-h-screen z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100 bg-slate-50/30">
              <h3 className="text-slate-900">Schedule Generation</h3>
              <button
                onClick={() => {
                  setActiveScheduler(null);
                  setMediaFile(null);
                }}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-4">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
                <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
                  {activeScheduler.prompt}
                </p>
              </div>
              <div className="bg-slate-50  rounded-2xl p-6 border border-slate-100 space-y-4">
                <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
                  {activeScheduler.content}
                </p>
                {activeScheduler.mediaUrl && 
                  <img
                    src={activeScheduler.mediaUrl}
                    alt="preview"
                    className="w-full aspect-video object-cover rounded-xl border border-slate-200 shadow-sm"
                  />
                }
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-slate-600 uppercase tracking-widest">
                  Media
                </label>
                {mediaFile ? (
                  <div className="relative border border-slate-200 bg-slate-50 rounded-xl overflow-hidden">
                    {mediaFile.type.startsWith("image/") ? (
                      <img
                        src={mediaPreviewUrl}
                        alt="preview"
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <video
                        src={mediaPreviewUrl}
                        className="w-full h-48 object-cover"
                        controls
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setMediaFile(null)}
                      className="absolute top-2 right-2 size-7 bg-slate-900/60 hover:bg-slate-900/80 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-red-300 hover:bg-red-50/30 transition-all group">
                    <ImageIcon className="size-4 text-slate-400 group-hover:text-red-500" />
                    <span className="text-sm text-slate-500 group-hover:text-red-600 transition-colors">
                      Click to upload image or video
                    </span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files?.[0] && setMediaFile(e.target.files[0])
                      }
                    />
                  </label>
                )}
              </div>
            </div>
            <div className="p-8 bg-slate-50/50 border-t border-slate-50 space-y-8">
            <div className="spce-y-6">
              <div className="">
                <label htmlFor="" className="block text-xs text-slate-600 uppercase tracking-widest mb-4">Select Channels</label>
                <div className="flex flex-wrap gap-2">
                      {PLATFORMS.map((p)=>{
                        const active = selectedPlatforms.includes(p.id);
                        return (
                          <button key={p.id} onClick={()=> setSelectedPlatforms((prev)=>(prev.includes(p.id) ? prev.filter((x)=>x !==p.id):[...prev,p.id]))} className={`p-2.5 rounded-md border text-xs ${active ? "bg-red-500/80 text-white":"bg-white border border-slate-200 text-slate-400 hover:border-slate-300"}`}>
                            <p.icon className="size-4.5" />
                          </button>
                        )
                      })}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <CalendarIcon className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="date" className="w-full p-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-md text-slate-900 text-sm focus:outline-none transition-all" value={scheduledDate} onChange={(e)=> setScheduledDate(e.target.value)} />
                </div>
                <div className="relative">
                  <ClockIcon className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="time" className="w-full p-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-md text-slate-900 text-sm focus:outline-none transition-all" value={scheduledTime} onChange={(e)=> setScheduledTime(e.target.value)} />
                </div>
              </div>
            </div>
            <button onClick={handleSchedule} className="w-full flex items-center justify-center gap-2 py-3 rounded-md bg-slate-200 text-slate-700 hover:bg-red-500 hover:text-white transition">
              {scheduling ? <Loader2Icon className="size-4 animate-spin"/>:<TimerIcon className="size-4"/>} Schedule Post
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiComposer;
