// src/components/Tokenmint.tsx
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface TokenmintProps {
  openModal: boolean
  setModalState: (value: boolean) => void
}

const Tokenmint = ({ openModal, setModalState }: TokenmintProps) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [assetName, setAssetName] = useState<string>('')
  const [unitName, setUnitName] = useState<string>('')
  const [totalSupply, setTotalSupply] = useState<string>('')
  const [decimals, setDecimals] = useState<string>('0')

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({ algodConfig })

  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  const handleMintToken = async () => {
    if (!transactionSigner || !activeAddress) {
      enqueueSnackbar('Please connect your wallet first', { variant: 'warning' })
      return
    }

    if (!assetName || !unitName || !totalSupply) {
      enqueueSnackbar('Please fill out all fields', { variant: 'warning' })
      return
    }

    setLoading(true)
    try {
      enqueueSnackbar('Minting Token...', { variant: 'info' })

      // Convert supply and decimals
      const supplyBigInt = BigInt(totalSupply)
      const decimalsBigInt = BigInt(decimals)

      // Adjust total to be on-chain (e.g., supply * 10^decimals)
      const onChainTotal = supplyBigInt * BigInt(10) ** decimalsBigInt

      const createResult = await algorand.send.assetCreate({
        sender: activeAddress,
        signer: transactionSigner,
        total: onChainTotal,
        decimals: Number(decimalsBigInt),
        assetName,
        unitName,
        defaultFrozen: false,
      })

      enqueueSnackbar(
        `Token minted successfully! TX ID: ${createResult.txIds[0]}`,
        { variant: 'success' }
      )

      // Reset form
      setAssetName('')
      setUnitName('')
      setTotalSupply('')
      setDecimals('0')
    } catch (e) {
      console.error(e)
      enqueueSnackbar('Failed to mint token', { variant: 'error' })
    }
    setLoading(false)
  }

  return (
    <dialog
      id="token_mint_modal"
      className={`modal ${openModal ? 'modal-open' : ''} bg-slate-200`}
    >
      <form method="dialog" className="modal-box">
        <h3 className="font-bold text-lg">Mint a Fungible Token</h3>
        <br />
        <input
          type="text"
          placeholder="Asset Name (e.g. MasterPass Token)"
          className="input input-bordered w-full mb-2"
          value={assetName}
          onChange={(e) => setAssetName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Unit Name (e.g. MPT)"
          className="input input-bordered w-full mb-2"
          value={unitName}
          onChange={(e) => setUnitName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Total Supply (e.g. 1000000)"
          className="input input-bordered w-full mb-2"
          value={totalSupply}
          onChange={(e) => setTotalSupply(e.target.value)}
        />
        <input
          type="number"
          placeholder="Decimals (0 for whole tokens)"
          className="input input-bordered w-full mb-2"
          value={decimals}
          onChange={(e) => setDecimals(e.target.value)}
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
            className={`btn ${
              assetName && unitName && totalSupply ? '' : 'btn-disabled'
            }`}
            onClick={handleMintToken}
            type="button"
          >
            {loading ? (
              <span className="loading loading-spinner" />
            ) : (
              'Mint Token'
            )}
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default Tokenmint
