import React, { useEffect, useState } from 'react'
import { PortableText } from 'next-sanity'
import { Project } from '@/types'
import Image from 'next/image'
import ReactPlayer from 'react-player'
import VideoPlayer from './VideoPlayer'
import { getYouTubeId } from '@/sanity/lib/utils'

const Modal = ({ onClose, data, renderAsset }: { onClose: any, data: any, renderAsset: any }) => {
    const count = data.length;

    useEffect(() => {
        console.log(data)
    }, [data])

    return (
        <div className='modal__container'>
            <div className="modal">
                <div className="modal__control">
                    <div>[{count}]</div>
                    <div>
                        {count > 1 &&
                        <>
                            <button>[Prev]</button>
                            <button>[Next]</button>    
                        </>
                        }
                    </div>
                    <button onClick={onClose}>[Close]</button>
                </div>
                <div className="modal_asset">{data.map(renderAsset)}</div>
            </div>
        </div>
    )
}

export default Modal;
