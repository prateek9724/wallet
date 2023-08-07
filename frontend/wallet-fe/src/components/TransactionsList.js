import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import Loader from './loader';
import { apiCall } from '../services/httpService';
import { Box, TableContainer, Table, TableBody, TableHead, TableRow, TablePagination, TableCell, IconButton, Paper } from '@material-ui/core';
import { KeyboardArrowLeft, KeyboardArrowRight, CheckCircle, Cancel, FileCopy, CloudDownload } from '@material-ui/icons';

const copyToClipBoard = (value) => {
    navigator.clipboard.writeText(value)
}

const tableHeadRow = [
    {
        id: 'date',
        label: 'Date',
        cb: (data) => {
            const dateTme = new Date(data).toLocaleString();
            return dateTme
        }
    },
    {
        id: 'id',
        label: 'Transaction Id',
        cb: (data) => {
            return (<div style={{ display: 'flex', width: "100%" }}> {data.slice(data.length - 7)}
                <FileCopy onClick={() => copyToClipBoard(data)} />
            </div>)
        }
    },
    {
        id: 'amount',
        label: 'Amount'
    },
    {
        id: 'balance',
        label: 'Updated Balance'
    },
    {
        id: 'status',
        label: 'Status',
        cb: (data) => {
            switch (data) {
                case 'COMPLETED': return <div className="greenIcon"><CheckCircle /></div>;
                case 'FAILED': return <div className="redIcon"><Cancel /></div>;
                default: return null;
            }
        }
    }
]


const PaginationAcions = (props) => {
    const { count, page, rowsPerPage, onChangePage } = props;

    const handleBackButtonClick = (event) => {
        onChangePage(event, page - 1);
    };

    const handleNextButtonClick = (event) => {
        onChangePage(event, page + 1);
    };

    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton
                onClick={handleBackButtonClick}
                disabled={page === 0}
                aria-label="Previous page"
            >
                <KeyboardArrowLeft />
            </IconButton>

            <IconButton
                onClick={handleNextButtonClick}
                disabled={count < rowsPerPage}
                aria-label="Next page"
            >
                <KeyboardArrowRight />
            </IconButton>
        </Box>
    )
}

export default function TransactionsList({ walletId }) {

    const [loading, setLoading] = useState(false);
    const [transactionsList, setTransactionsList] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [page, setPage] = useState(0);

    useEffect(() => {
        getTransactionsList(page, rowsPerPage);
    }, [])

    const getTransactionsList = async (skip, limit) => {
        try {
            setLoading(true);
            const response = await apiCall({
                endpoint: `/api/v1/wallet/transactions/`,
                method: 'GET',
                queryParams: {
                    walletId,
                    skip: skip * limit,
                    limit
                }
            })
            console.log('Transactions list: ', response);
            setTransactionsList(response);
        } catch (e) {
            console.error('Error in getting the transactions list', e, {});

        } finally {
            setLoading(false);
        }
    }


    const handleChangePage = (e, newPage) => {
        console.log('newPage: ', newPage)
        setPage(newPage);
        getTransactionsList(newPage, rowsPerPage)
    }
    const handleChangeRowsPerPage = (e) => {
        console.log('rowsPerPage: ', Number.parseInt(e.target.value, 10))
        setRowsPerPage(Number.parseInt(e.target.value, 10));
        setPage(0);
        getTransactionsList(0, Number.parseInt(e.target.value, 10));
    }

    const getDataCells = (row) => {
        return (
            tableHeadRow.map(el => <TableCell>{el?.cb ? el?.cb(row[el?.id]) : row[el?.id]}</TableCell>)
        )
    }

    const downloadCsv = () => {
        const headers = [['TransactionId', 'Date', 'Amount', 'Type', 'Updated Balance', 'Status'].join(',')];
        const data =  transactionsList.reduce((acc, el) => {
            const {id, date,amount, type, balance, status} = el;
            acc.push([id, new Date(date).toLocaleDateString()+ ' ' + new Date(date).toLocaleTimeString(), amount, type, balance, status].join(','));
            return acc;
        }, [])
        const blob = new Blob([[...headers, ...data].join('\n')], { type: 'text/csv' })
        // Create an anchor element and dispatch a click event on it
        // to trigger a download
        const a = document.createElement('a')
        a.download = 'transactions.csv'
        a.href = window.URL.createObjectURL(blob)
        const clickEvt = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
        })
        a.dispatchEvent(clickEvt)
        a.remove()
    }

    return (
        <>
            {loading && <Loader />}
            <div className='tableContainer'>
                <TableContainer component={Paper} >
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <div className='downloadBtn' onClick={downloadCsv} >
                                        <CloudDownload />
                                        <span style={{ "margin-left": "10px" }}>CSV</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableHead>
                            <TableRow>
                                {tableHeadRow.map(el => <TableCell>{el?.label}</TableCell>)}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactionsList.map(el => <TableRow> {getDataCells(el)} </TableRow>)}
                        </TableBody>

                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={transactionsList.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onChangePage={handleChangePage}
                        onChangeRowsPerPage={handleChangeRowsPerPage}
                        ActionsComponent={PaginationAcions}
                        labelRowsPerPage={'Transactions per page'}
                        labelDisplayedRows={({ from, to, count, page }) => `${from}-${from + count - 1}`}
                    />
                </TableContainer>

            </div>
        </>
    )
}
