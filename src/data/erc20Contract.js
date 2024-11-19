import { wagmiReadContract, submitTx } from './wagmi'
import erc20abi from './erc20abi'

const getTokenAllowance = async function ({ tokenAddress, ownerAddress, allowedSpenderAddress }) {
  const result = await wagmiReadContract({
    address: tokenAddress,
    abi: erc20abi,
    functionName: "allowance",
    args: [ownerAddress, allowedSpenderAddress],
  });
  // console.log('getTokenAllowance', result, typeof result)
  return result
}

const approveToken = async function ({ tokenAddress, allowedSpenderAddress, amountBigint }) {
  const receipt = await submitTx({
    address: tokenAddress,
    abi: erc20abi,
    functionName: "approve",
    args: [allowedSpenderAddress, amountBigint]
  })
  return receipt
}

export default {
  getTokenAllowance,
  approveToken
}
