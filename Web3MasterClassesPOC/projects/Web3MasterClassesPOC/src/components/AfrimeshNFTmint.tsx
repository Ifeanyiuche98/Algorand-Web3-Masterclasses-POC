// src/components/AfrimeshNFTmint.tsx
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { sha512_256 } from 'js-sha512'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface AfrimeshNFTmintProps {
  openModal: boolean
  setModalState: (value: boolean) => void
}

const AfrimeshNFTmint = ({ openModal, setModalState }: AfrimeshNFTmintProps) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [metadataUrl, setMetadataUrl] = useState<string>('')

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({ algodConfig })

  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  const handleMintNFT = async () => {
    if (!transactionSigner || !activeAddress) {
      enqueueSnackbar('Please connect your wallet first', { variant: 'warning' })
      return
    }

    if (!metadataUrl) {
      enqueueSnackbar('Please paste a metadata URL', { variant: 'warning' })
      return
    }

    setLoading(true)
    try {
      enqueueSnackbar('Minting NFT...', { variant: 'info' })

      const createNFTResult = await algorand.send.assetCreate({
        sender: activeAddress,
        signer: transactionSigner,
        total: 1n, // Only one NFT
        decimals: 0,
        assetName: 'MasterPass Ticket',
        unitName: 'MTK',
        url: metadataUrl,
        metadataHash: new Uint8Array(Buffer.from(sha512_256.digest(metadataUrl))),
        defaultFrozen: false,
      })

      enqueueSnackbar(`NFT minted! TX ID: ${createNFTResult.txIds[0]}`, {
        variant: 'success',
      })
      setMetadataUrl('')
    } catch (e) {
      console.error(e)
      enqueueSnackbar('Failed to mint NFT', { variant: 'error' })
    }

    setLoading(false)
  }

  return (
    <dialog
      id="nft_mint_modal"
      className={`modal ${openModal ? 'modal-open' : ''} bg-slate-200`}
    >
      <form method="dialog" className="modal-box">
        <h3 className="font-bold text-lg">Mint Afrimesh MasterPass NFT</h3>
        <br />
        <input
          type="text"
          placeholder="Paste your metadata URL from Pinata"
          className="input input-bordered w-full"
          value={metadataUrl}
          onChange={(e) => setMetadataUrl(e.target.value)}
        />
        <div className="modal-action">
          <button
            className="btn"
            onClick={() => setModalState(!openModal)}
            type="button"
          >
            Close
          </button>
          <button
            className={`btn ${metadataUrl.length > 0 ? '' : 'btn-disabled'}`}
            onClick={handleMintNFT}
            type="button"
          >
            {loading ? <span className="loading loading-spinner" /> : 'Mint NFT'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default AfrimeshNFTmint
