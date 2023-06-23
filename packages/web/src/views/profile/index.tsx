import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Row,
  Button,
  Col,
  Input,
  Spin,
} from 'antd';

import { updateNFT } from '../../actions'; // This is update function
import {
  MAX_METADATA_LEN,
  useConnection,
  IMetadataExtension,
  MetadataCategory,
  useConnectionConfig,
  Creator,
  shortenAddress,
  MetaplexModal,
  MetaplexOverlay,
  MetadataFile,
  StringPublicKey,
  WRAPPED_SOL_MINT,
  getAssetCostToStore,
  LAMPORT_MULTIPLIER,
  Attribute,
  ENDPOINTS
} from '@oyster/common';
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
// import domtoimage from 'dom-to-image'
// import * as htmlToImage from 'html-to-image';
import html2canvas from "html2canvas";

import { useWallet } from '@solana/wallet-adapter-react';
import { useHistory, useParams } from 'react-router-dom';
import useWindowDimensions from '../../utils/layout';
import {
  LoadingOutlined, UserOutlined, IdcardOutlined
} from '@ant-design/icons';
import { apiCaller } from '../../utils/fetcher';
import { DaoImg1, Favicon, MetamaskImg, NFTImage, PhantomImg, SolIcon, LogoImg } from '../../assets/images';


interface UserInfoExtension {
  domain: string;
  title: string;
  solanaAddress: string;
  ethereumAddress?: string;
  collection: any;
  daoMemberships: {
    checked: boolean;
    daoIds: any;
  };
  isNftSelectedAsAvatar: boolean;
  uploadImage: {
    url: string;
    publicId: string;
    title: string;
  };
  profileImage: {
    link: string;
    network: string;
    contractAddress?: string;
    tokenId?: string;
    mintAddress: string;
  };
  _id: string;
  rooms?: any;
  invitations?: any;
  followerCount?: number;
  discordConnected: boolean;
  twitterConnected: boolean;
  discordUsername?: string;
  twitterUsername?: string;
  githubUsername?: string;
}

const baseUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/"
    : "https://solarity-stage.vercel.app";

export const Profile = () => {
  const history = useHistory();
  const { width } = useWindowDimensions();
  const connection = useConnection();
  const { endpoint } = useConnectionConfig();
  const wallet = useWallet();
  const { publicKey, connected, connect } = useWallet()
  // const { mintAddress }: { mintAddress: string } = useParams();
  // console.log("mintAddress", mintAddress)

  const [alertMessage, setAlertMessage] = useState<string>();
  const [nftCreateProgress, setNFTcreateProgress] = useState<number>(0);
  const [step, setStep] = useState<number>(0);
  const [isMinting, setMinting] = useState<boolean>(false);
  const [nft, setNft] = useState<
    { metadataAccount: StringPublicKey } | undefined
  >(undefined);
  const [files, setFiles] = useState<File[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfoExtension>()
  const [attributes, setAttributes] = useState<IMetadataExtension>({
    name: '',
    symbol: '',
    collection: '',
    description: '',
    external_url: '',
    image: '',
    animation_url: undefined,
    attributes: undefined,
    seller_fee_basis_points: 0,
    creators: [],
    properties: {
      files: [],
      category: MetadataCategory.Image,
    },
  });
  const [walletAddress, setWalletAddress] = useState('')
  const [passportWidth, setPassportWidth] = useState()
  const [passportHeight, setPassportHeight] = useState()
  // const [newDomain, setNewDomain] = useState('')
  // const [newTitle, setNewTitle] = useState('')
  const [newInfo, setNewInfo] = useState({
    domain: '',
    title: '',
  })

  useEffect(() => {
    // if (!connected) {
    //   connect()
    // }
  }, [])

  useEffect(() => {
    if (publicKey?.toBase58()) {
      let address = publicKey?.toBase58()
      console.log('addddddddddddddddddddd', address)
      setWalletAddress(address)
      if (address) {
        getUserInfo(address)
          .then(res => {
            console.log("resres: ", res)
            setUserInfo(res)

            // mint(res)
          })
          .catch(err => {
            console.log(err)
          })
      } else {
        setAlertMessage("You are not verified")
        setNFTcreateProgress(1)
      }
    }
  }, [publicKey?.toBase58()])

  // store files
  const mint = async (userInfo) => {
    var ele = document.getElementById('passport')
    var newOne = document.createElement('div');

    var imageHtml = document.getElementById('passport-image')
    // console.log(ele)

    const canvas = await html2canvas(!ele ? newOne : ele)
    // console.log(canvas)
    const dataURL = await canvas.toDataURL("image/jpeg", 1.0);
    let tempFiles = files;
    var blobBin = atob(dataURL.split(',')[1]);

    var arr: any = [];
    for (var i = 0; i < blobBin.length; i++) {
      arr.push(blobBin.charCodeAt(i));
    }
    // var file=new File([], {type: 'image/png'});

    tempFiles[0] = new File([new Uint8Array(arr)], "passport.jpg", { type: "image/jpeg" });
    // console.log(files, tempFiles)
    setFiles(tempFiles);
    console.log(files)

    let metadata = {
      name: newInfo.domain,
      symbol: "PASSPORT",
      creators: [new Creator({
        address: userInfo.solanaAddress,
        verified: true,
        share: 100
      })],
      collection: "",
      description: newInfo.title,
      sellerFeeBasisPoints: 0,
      image: userInfo.isNftSelectedAsAvatar ? userInfo.profileImage.link : userInfo.uploadImage.url,
      animation_url: undefined,
      attributes: [] as Attribute[],
      external_url: '',
      properties: {
        files: files.map((file) => {
          return {
            uri: file.name,
            type: file.type
          } as MetadataFile
        }),
        category: MetadataCategory.Image,
      },
    };
    console.log("metaatta12", metadata)

    let tempAttributes: Attribute[] = []

    if (userInfo.solanaAddress) {
      const attribute = {
        trait_type: 'Solana address',
        display_type: 'string',
        value: userInfo.solanaAddress
      }
      tempAttributes.push(attribute)
    }

    if (userInfo.ethereumAddress) {
      const attribute = {
        trait_type: 'Ethereum address',
        display_type: 'string',
        value: userInfo.ethereumAddress
      }
      tempAttributes.push(attribute)
    }

    if (userInfo.discordConnected) {
      const attribute = {
        trait_type: 'Discord',
        display_type: 'string',
        value: userInfo.discordUsername
      }
      tempAttributes.push(attribute)
    }

    if (userInfo.twitterConnected) {
      const attribute = {
        trait_type: 'Twitter',
        display_type: 'string',
        value: userInfo.twitterUsername
      }
      tempAttributes.push(attribute)
    }

    if (userInfo.daos.length) {
      userInfo.daos.forEach((dao, index) => {
        const attribute = {
          trait_type: `Dao ${index}`,
          display_type: 'string',
          value: dao.name
        }
        tempAttributes.push(attribute)
      });
    }

    metadata.attributes = tempAttributes
    // console.log("metaatta42", typeof metadata.attributes)

    console.log("latest metadata: ", metadata)
    setMinting(true);
    console.log("endpoint", endpoint)
    // return;
    try {
      // I used the same frontend for nft mint and update.
      const _nft = await updateNFT(
        // const _nft = await updateNFT(
        connection,
        wallet,
        endpoint.name,
        files,
        metadata,
        userInfo.passportNftAddress,
        setNFTcreateProgress,
        attributes.properties?.maxSupply,
      );
      if (_nft) setNft(_nft);

      await updateProfileInfo(newInfo)

      setAlertMessage('');
    } catch (e: any) {
      setAlertMessage(e.message);
    } finally {
      setMinting(false);
    }
  };

  if (!wallet || !publicKey) {
    return null;
  }

  return (
    <>
      <a href={`${baseUrl}`} className='logo-container'>
        <Image src={LogoImg} width={40} height={40} />
        <div className='logo-text' style={{ marginLeft: '10px', color: 'white' }}>Solarity</div>
      </a>
      <Row className={'creator-base-page'}>
        <Col span={24} lg={{ span: 24 }}>
          <PassportCard
            user={userInfo}
            address={walletAddress}
            // setPassportWidth={setPassportWidth}
            // setPassportHeight={setPassportHeight}
            onMint={mint}
            isMinting={isMinting}
            setNewInfo={setNewInfo}
            newInfo={newInfo}
          />
        </Col>
      </Row>
      <MetaplexOverlay visible={nftCreateProgress === 1}>
        <Congrats alert={alertMessage} />
      </MetaplexOverlay>
    </>
  );
};

const Congrats = (props: {
  alert?: string;
}) => {
  const history = useHistory();

  if (props.alert) {
    // TODO  - properly reset this components state on error
    return (
      <>
        <div className="waiting-title">Sorry, there was an error!</div>
        <p>{props.alert}</p>
        <Button onClick={() => history.push('/profile')}>
          Back to Updaet NFT
        </Button>
      </>
    );
  }

  const backTo = () => {
    window.location.href = baseUrl
  }

  return (
    <>
      <div className="waiting-title">Congratulations, you updated your NFT!</div>
      <div className="congrats-button-container">
        <Button
          className="metaplex-button"
          onClick={backTo}
        >
          <span>Back to Home Page</span>
          <span>&gt;</span>
        </Button>
      </div>
      {/* <Confetti /> */}
    </>
  );
};

const PassportCard = (props) => {
  const { user, address, onMint, isMinting, setNewInfo, newInfo } = props;
  const passportRef: React.MutableRefObject<any> = useRef()

  const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  const onChangeNewInfoValue = (event) => {
    // console.log(event)
    setNewInfo({
      ...newInfo,
      [event.target.name]: event.target.name === "domain" ? event.target.value + ".verse" : event.target.value
    })
  }

  return (
    <>
      {/* <button onClick={onMint}>Mint</button> */}
      <div className='passport-wrapper'>
        <div className='passport-header'>
          <h1 className='passport-title'>Updating Passport</h1>
          <div className='address-container'>
            <div className='icon-wrapper'>
              <Image src={SolIcon} width={32} height={32} />
            </div>
            <div className='address-text'>
              {shortenAddress(address, 3)}
            </div>
          </div>
        </div>
        <div className='passport-content' id='passport' ref={passportRef}>
          {
            user ?
              <>
                <div className='passport-main-content'>
                  <div className='passport-avatar-container'>
                    <div className='passport-avatar-wrapper'>
                      {
                        user.isNftSelectedAsAvatar ?
                          <Image src={user.profileImage?.link} width={150} height={150} />
                          :
                          <Image src={user.uploadImage?.url} width={150} height={150} />
                        // <LazyLoadImage
                        //   height={150}
                        //   width={150}
                        //   src={user.uploadImage?.url} // use normal <img> attributes as props
                        //   after
                        // />
                      }
                    </div>
                  </div>
                  <div className='passport-domain'>
                    {
                      newInfo.domain === '' ? user?.domain : newInfo.domain
                    }
                  </div>
                  <div className='passport-title'>
                    {
                      newInfo.title === '' ? user?.title : newInfo.title
                    }
                  </div>
                  <div className='passport-socials'>
                    Connect Your Socials
                  </div>
                </div>
                <div className='passport-sub-content'>
                  <div className='passport-wallets-container'>
                    <h2 className='passport-subtitle'>Wallets</h2>
                    <div className='passport-wallets'>
                      {user.solanaAddress ? <Image src={PhantomImg} width={34} height={34} /> : null}
                      {user.ethereumAddress ? <Image src={MetamaskImg} width={34} height={34} /> : null}
                    </div>
                  </div>
                  {/* <div className='divide-line'></div> */}
                  <div className='passport-daos-container'>
                    <h2 className='passport-subtitle'>Your DAOs</h2>
                    <div className='passport-daos'>
                      <ul className='passport-dao-items'>
                        {
                          user?.daos.map((dao, index) => (
                            <li className='passport-dao-item' key={index}><Image src={dao.profileImageLink} width={34} height={34} /></li>
                          ))
                        }
                      </ul>
                    </div>
                  </div>
                </div>
                {
                  isMinting
                    ?
                    <div className='layer'>
                      <div className='wrapper'>
                        <Spin indicator={loadingIcon} />
                        <div>Minting...</div>
                      </div>
                    </div>
                    : null
                }
              </>
              :
              <div className='no-userdata'>
                There is no data. Please register first.
              </div>
          }
        </div>
        <div className='passport-content' style={{ marginTop: '20px' }}>
          <div className='input-item'><Input size="large" placeholder="Input your new domain" prefix={<UserOutlined />} onChange={onChangeNewInfoValue} name={'domain'} disabled={isMinting ? true : false} /></div>
          <div className='input-item'><Input size="large" placeholder="Input your new title" prefix={<IdcardOutlined />} onChange={onChangeNewInfoValue} name={'title'} disabled={isMinting ? true : false} /></div>
        </div>
        <div className='update-button-container'>
          <button className='update-profile-btn' onClick={() => onMint(user)}>Save changes</button>
        </div>
      </div>
    </>
  )
}

const getUserInfo = async (address) => {
  console.log('real addresss-------------', address)
  if (!address) return;

  try {
    const {
      data: { user: user },
    } = await apiCaller.get(`/users/wallet/${address}`);

    return user
  } catch (err) {
    console.log(err)
  }
}

const updateProfileInfo = async (newUserInfo) => {
  if (!newUserInfo) return;

  try {
    const payload = {
      ...newUserInfo,
      action: "info"
    }
    const response = apiCaller.patch(`/profile/userInfo`, payload)

  } catch (err) {
    console.log(err)
  }
}