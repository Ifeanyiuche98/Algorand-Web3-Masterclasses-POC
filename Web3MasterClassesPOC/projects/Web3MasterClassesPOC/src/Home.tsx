// src/components/Home.tsx
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import Transact from './components/Transact'
import AfrimeshNFTmint from './components/AfrimeshNFTmint'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [openPaymentModal, setOpenPaymentModal] = useState<boolean>(false)
  const [openMintModal, setOpenMintModal] = useState<boolean>(false)

  const { activeAddress } = useWallet()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-teal-400 to-purple-500 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-lg w-full text-center">
        {/* Main Headline */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-teal-600">
          Welcome to <br />
          <span className="text-purple-600">AfriMesh MasterPass 🎟️</span>
        </h1>

        {/* Subheading */}
        <p className="text-gray-600 mb-8 text-base md:text-lg">
          Your ticket to join the AfriMesh Web. AfriMesh is a decentralized, community-powered WiFi network built on Algorand. <br />
          Connect, explore, and get inspired!
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-4">
          <button
            data-test-id="connect-wallet"
            className="btn btn-primary"
            onClick={() => setOpenWalletModal(true)}
          >
            Please Connect Wallet
          </button>

          {activeAddress && (
            <>
              <button
                data-test-id="send-payment"
                className="btn bg-purple-500 text-white hover:bg-purple-600"
                onClick={() => setOpenPaymentModal(true)}
              >
                Send Payment
              </button>

              <button
                data-test-id="mint-nft"
                className="btn bg-teal-500 text-white hover:bg-teal-600"
                onClick={() => setOpenMintModal(true)}
              >
                Mint AfriMesh MasterPass NFT
              </button>
            </>
          )}
        </div>

        {/* Modals */}
        <ConnectWallet openModal={openWalletModal} closeModal={() => setOpenWalletModal(false)} />
        <Transact openModal={openPaymentModal} setModalState={setOpenPaymentModal} />
        <AfrimeshNFTmint openModal={openMintModal} setModalState={setOpenMintModal} />
      </div>
    </div>
  )
}

export default Home
