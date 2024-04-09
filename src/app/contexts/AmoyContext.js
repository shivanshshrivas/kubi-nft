import React, { createContext, useContext, useEffect, useState } from "react";

const AmoyContext = createContext();

export const AmoyProvider = ({ children }) => {
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false); // New state to track wallet connection
  const [currentChainId, setCurrentChainId] = useState(null);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);

  useEffect(() => {
    const checkMetaMask = async () => {
      if (
        typeof window.ethereum !== "undefined" &&
        window.ethereum.isMetaMask
      ) {
        setIsMetaMaskInstalled(true);
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setWalletConnected(true);
          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          });
          setCurrentChainId(chainId);
        }
        window.ethereum.on("chainChanged", (chainId) => {
          setCurrentChainId(chainId);
          window.location.reload(); // Optional: reload the page to ensure chain change is processed
        });
        window.ethereum.on("accountsChanged", (accounts) => {
          if (accounts.length > 0) {
            setWalletConnected(true);
          } else {
            setWalletConnected(false);
          }
        });
      }
    };
    checkMetaMask();
  }, []);

  const connectWallet = async () => {
    if (isMetaMaskInstalled) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        setWalletConnected(true);
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      window.open("https://metamask.io/download.html", "_blank");
    }
  };

  const addPolygonAmoyNetwork = async () => {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });

      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x13882",
            chainName: "Polygon Amoy Testnet",
            nativeCurrency: {
              name: "MATIC",
              symbol: "MATIC",
              decimals: 18,
            },
            rpcUrls: ["https://rpc-amoy.polygon.technology/"],
            blockExplorerUrls: ["https://www.oklink.com/amoy"],
          },
        ],
      });

      // After adding, re-fetch the chain ID
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      setCurrentChainId(chainId);
    } catch (error) {
      console.error("Failed to add the Polygon Amoy network:", error);
    }
  };
  const toggleNetworkModal = () => {
    setIsNetworkModalOpen(!isNetworkModalOpen);
  };

  const checkIsOnAmoyNetwork = () => {
    return currentChainId === "0x13882";
  };

  return (
    <AmoyContext.Provider
      value={{
        isMetaMaskInstalled,
        walletConnected,
        currentChainId,
        addPolygonAmoyNetwork,
        isNetworkModalOpen,
        setIsNetworkModalOpen,
        connectWallet,
        toggleNetworkModal,
        checkIsOnAmoyNetwork,
      }}
    >
      {children}
    </AmoyContext.Provider>
  );
};

export function useAmoy() {
  return useContext(AmoyContext);
}
