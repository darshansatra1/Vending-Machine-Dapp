import Head from 'next/head'
import { useState, useEffect } from 'react'
import Web3 from 'web3'
import vendingMachineContract from '../blockchain/vending'
import 'bulma/css/bulma.css'
import LoadingOverlay from 'react-loading-overlay-ts';
import styles from '../styles/VendingMachine.module.css'
import Swal from 'sweetalert2'
const VendingMachine = () => {
    const [inventory, setInventory] = useState('')
    const [myDonutCount, setMyDonutCount] = useState('')
    const [buyCount, setBuyCount] = useState('')
    const [web3, setWeb3] = useState(null)
    const [address, setAddress] = useState(null)
    const [vmContract, setVmContract] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (vmContract) getInventoryHandler()
        if (vmContract && address) getMyDonutCountHandler()
    }, [vmContract, address])

    const getInventoryHandler = async () => {
        const inventory = await vmContract.methods.getVendingMachineBalance().call()
        setInventory(inventory)
    }

    const getMyDonutCountHandler = async () => {
        const count = await vmContract.methods.donutBalances(address).call()
        setMyDonutCount(count)
    }

    const updateDonutQty = event => {
        setBuyCount(event.target.value)
    }

    const buyDonutHandler = async () => {
        try {
            setLoading(true);

            await vmContract.methods.purchase(parseInt(buyCount)).send({
                from: address,
                value: web3.utils.toWei('0.0001', 'ether') * buyCount,
                gas: 3000000,
                gasPrice: null
            });

            if (vmContract) getInventoryHandler()
            if (vmContract && address) getMyDonutCountHandler()
            setLoading(false);
            Swal.fire(
                'Yippie!',
                `You have successfully purchased ${buyCount} donuts`,
                'success'
            );
            setBuyCount("");
        } catch (err) {
            setLoading(false);
            setBuyCount("");
            Swal.fire(
                'Oops!',
                `Transaction failed`,
                'error'
            );
        }
    }

    const connectWalletHandler = async () => {
        /* check if MetaMask is installed */
        if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
            try {
                /* request wallet connect */
                await window.ethereum.request({ method: "eth_requestAccounts" })
                /* create web3 instance and set to state var */
                const web3 = new Web3(window.ethereum)
                /* set web3 instance */
                setWeb3(web3)
                /* get list of accounts */
                const accounts = await web3.eth.getAccounts()
                /* set Account 1 to React state var */
                setAddress(accounts[0])


                /* create local contract copy */
                const vm = vendingMachineContract(web3)
                setVmContract(vm)
                Swal.fire(
                    'Yayy!',
                    `Wallet succesfully connected`,
                    'success'
                );
            } catch (err) {
                Swal.fire(
                    'Oops!',
                    `Connections error`,
                    'error'
                );
            }
        } else {
            Swal.fire(
                'Oops!',
                `No wallet found`,
                'error'
            );
        }
    }

    const reStock = async () => {
        await vmContract.methods.restock(parseInt(2)).call();
        if (vmContract) getInventoryHandler()
        if (vmContract && address) getMyDonutCountHandler()
    }

    return (

        <LoadingOverlay
            active={loading}
            spinner
            text="Transaction in process"
        >
            <div className={styles.main} >
                <Head>
                    <title>VendingMachine App</title>
                    <meta name="description" content="A blockchain vending app" />
                </Head>
                <nav className="navbar is-dark is-fixed-top" role="navigation" aria-label='main navigation'
                    style={{
                        paddingLeft: '70px',
                        paddingRight: '70px',
                        paddingTop: '20px',
                    }}
                >
                    <div className="navbar-brand"
                    >
                        <a className="navbar-item" href="https://bulma.io">
                            <img src="https://ethereum.org/static/a110735dade3f354a46fc2446cd52476/db4de/eth-home-icon.webp" />
                        </a>
                        <div className="navbar-brand">
                            <h1>Donut Xpress</h1>
                        </div>
                    </div>
                    <div className="navbar-end">
                        {/* <button onClick={reStock} className="button is-warning"
                            style={{
                                marginRight: "20px",
                            }}>Restock</button> */}
                        <button onClick={connectWalletHandler} className="button is-primary">Connect Wallet</button>
                    </div>
                </nav>
                <br />
                <br />
                <br />
                <br />
                <br />
                <div className="columns">
                    <div className="column">
                        <div className={styles.description}
                            style={{
                                paddingLeft: '100px',
                                paddingTop: '80px',
                            }}
                        >
                            Donut Xpress, a vending machine dapp to purchase donuts using Ethereum Wallet.
                            One donut costs <b>0.0001 eth</b>. You can view the number of donuts you have purchased on the blockchain.
                            <br /><br />
                            Don’t worry, we’ll never run out of donuts because the owner restocks the inventory regularly!
                        </div>
                    </div>
                    <div className="column">
                        <img src="/donut_machine.png" />
                    </div>
                </div>


                <section>
                    <div className={styles.description}
                        style={{
                            paddingLeft: '100px',
                        }}
                    >
                        <h2>Vending machine inventory: {inventory}</h2>
                    </div>
                </section>
                <section>
                    <div className={styles.description}
                        style={{
                            paddingLeft: '100px',
                        }}
                    >
                        <h2>My donuts: {myDonutCount}</h2>
                    </div>
                </section>
                <section className="mt-5">
                    <div className="container">
                        <div className="field">
                            <label className="label">
                                <div className={styles.description}
                                >
                                    Buy Donuts
                                </div>
                            </label>
                            <div className="control"
                                style={{
                                    width: "20%",
                                }}
                            >
                                <input value={buyCount} onChange={updateDonutQty} className="input is-hovered" type="type" placeholder="Enter amount..." />
                            </div>
                            <button
                                onClick={buyDonutHandler}
                                className="button is-primary mt-2"
                            >Buy</button>
                        </div>
                    </div>
                </section>
            </div>
        </LoadingOverlay>
    )
}

export default VendingMachine