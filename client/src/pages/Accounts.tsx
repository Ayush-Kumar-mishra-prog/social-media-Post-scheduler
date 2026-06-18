import { useEffect, useState } from "react";
import { PLATFORMS } from "../assets/assets";
import { PlusIcon } from "lucide-react";
import AccountList from "../components/Home/AccountList";
import PlateFormPickerModel from "../components/Home/PlateFormPickerModel";
import { toast } from "react-toastify";
import api from "../api/axios";

const Accounts = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showPlatformPicker, setShowPlatformPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 

  // const fetchAccounts = async (
  //   isSync = false,
  //   platform?: string | null,
  //   successMsg?: string,
  // ) => {
  //   try {
  //       if(isSync){
  //         const label = platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : "Social Media";
  //         toast.loading(`Syncing ${label} account...`);
  //         await api.get("/api/oauth/sync");
  //         toast.success(successMsg || "Account synced!")
  //       }

  //       const {data} = api.get("/api/accounts")
  //       setAccounts(data)
  //   } catch (error:any) {
  //     toast.error(error?.message?.data?.message || error?.message || "failed to load accounts")
  //   }
  // };

  const fetchAccounts: any = async (
    isSync = false,
    platform?: string | null,
    successMsg?: string,
  ) => {
    setIsLoading(true); // Set loading to true before fetch
    // const toastId = toast.loading("Syncing account...");
    try {
      if (isSync) {
        const label = platform
          ? platform.charAt(0).toUpperCase() + platform.slice(1)
          : "Social Media";
        toast.info(`Syncing ${label} account...`);
        await api.get("/api/oauth/sync");
        toast.success(successMsg || "Account synced");
      }

      const { data } = await api.get("/api/accounts");
      setAccounts(data);
      setIsLoading(false); // Set loading to false after successful fetch
    } catch (error: any) {
      toast.error(
        error?.message?.data?.message ||
          error?.message ||
          "failed to load accounts",
      );
      setIsLoading(false); // Set loading to false after failed fetch
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connectedPlatforms = params.get("connected");
    const connectedUsername = params.get("username");
    const syncedNeeded = params.get("sync") === "true";
    const errorMsg = params.get("error");
    window.history.replaceState({}, document.title, window.location.pathname);
    if (connectedPlatforms) {
      const label =
        connectedPlatforms.charAt(0).toUpperCase() +
        connectedPlatforms.slice(1);
      const handle = connectedUsername ? `(@${connectedUsername})` : "";
      fetchAccounts(true, connectedPlatforms, `${label}${handle} connected`);
    } else if (errorMsg) {
      toast.error(`Connection failed ${decodeURIComponent(errorMsg)}`);
      fetchAccounts();
    } else if (syncedNeeded) {
      fetchAccounts(true, null, "Accounts synced");
    } else {
      fetchAccounts();
    }
  }, []);

  const handleDisconnect = async (accountId: string) => {
    try {
      await api.delete(`/api/accounts/${accountId}`);
      toast.success("Account Disconnected");
      await fetchAccounts();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          `failed to disconnect account`,
      );
    }
  };

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId);
    try {
      const { data } = await api.get(`/api/oauth/${platformId}/url`);
      window.location.href = data.url;
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          `failed to connect ${platformId}`,
      );
      setConnecting(null);
    }
  };
  const connectedIds = accounts.map((a) => a.platform);
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm">
        <div className="">
          <h2 className="text-xl text-slate-900">Connected Accounts</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {accounts.length} of {PLATFORMS.length} platforms connected
          </p>
        </div>
        <button
          onClick={() => setShowPlatformPicker(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-all w-full sm:w-auto justify-center"
        >
          <PlusIcon className="size-4" /> Connect Account
        </button>
      </div>
      {showPlatformPicker && (
        <PlateFormPickerModel
          connectedIds={connectedIds}
          connecting={connecting}
          onClose={() => setShowPlatformPicker(false)}
          onConnect={handleConnect}
        />
      )}

      <AccountList
        accounts={accounts}
        onDisconnect={handleDisconnect}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Accounts;
