import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
// import PSS from './../../assets/passport.png'
import {
  Steps,
  Row,
  Button,
  Col,
  Spin,
} from 'antd';

import { mintNFT } from '../../actions';
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
import {
  getLedgerWallet,
  getMathWallet,
  getPhantomWallet,
  getSlopeWallet,
  getSolflareWallet,
  getSolletWallet,
  getSolongWallet,
} from '@solana/wallet-adapter-wallets';
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
// import domtoimage from 'dom-to-image'
// import * as htmlToImage from 'html-to-image';
import html2canvas from "html2canvas";

import { useWallet } from '@solana/wallet-adapter-react';
// import { Connection } from '@solana/web3.js';
// import { MintLayout } from '@solana/spl-token';
// import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useHistory, useParams } from 'react-router-dom';
// import { getLast } from '../../utils/utils';
// import { AmountLabel } from '../../components/AmountLabel';
import useWindowDimensions from '../../utils/layout';
import {
  LoadingOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
// import { useTokenList } from '../../contexts/tokenList';
// import { SafetyDepositDraft } from '../../actions/createAuctionManager';
// import { ArtSelector } from '../auctionCreate/artSelector';
// import { add, update } from 'lodash';
import { apiCaller } from '../../utils/fetcher';
import { DaoImg1, Favicon, MetamaskImg, NFTImage, PhantomImg, SolIcon, LogoImg } from '../../assets/images';
import { useRouter } from 'next/router';

const { Step } = Steps;
// const { Dragger } = Upload;
// const { Text } = Typography;

interface UserInfoExtension {
  username: string;
  bio: string;
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
    ? "http://localhost:3000"
    : "https://solarity-new-frontend.vercel.app";

// const endpoint =
//   process.env.NODE_ENV === "development"
//     ? ENDPOINTS[0]
//     : ENDPOINTS[1];

export const PassportMint = () => {
  const history = useHistory();
  const router = useRouter()
  const { width } = useWindowDimensions();
  const connection = useConnection();
  const { endpoint } = useConnectionConfig();
  const wallet = useWallet();
  const { publicKey, connected, connect, select } = useWallet()
  // const { mintAddress } = router.query;
  const { mintAddress }: { mintAddress: string } = useParams();
  const phatomWallet = useMemo(() => getPhantomWallet(), []);

  const [alertMessage, setAlertMessage] = useState<string>();
  const [nftCreateProgress, setNFTcreateProgress] = useState<number>(0);
  const [step, setStep] = useState<number>(0);
  const [stepsVisible, setStepsVisible] = useState<boolean>(true);
  const [isMinting, setMinting] = useState<boolean>(false);
  const [nft, setNft] = useState<
    { metadataAccount: StringPublicKey } | undefined
  >(undefined);
  const [files, setFiles] = useState<File[]>([]);
  const [isCollection, setIsCollection] = useState<boolean>(false);
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
  // const [collection, setCollection] = useState<Array<SafetyDepositDraft>>([])

  useEffect(() => {
    select(phatomWallet.name);
  }, [])

  useEffect(() => {
    if (publicKey?.toBase58()) {
      let address = publicKey?.toBase58()
      setWalletAddress(address)
      if (address) {
        getUserInfo(address)
          .then(res => {
            if (res) {
              setUserInfo(res)
              console.log(res)
              setTimeout(() => {
                mint(res)
              }, 2000)
            }
          })
          .catch(err => {
            console.log(err)

          })
      } else {
        setNFTcreateProgress(9)
        setAlertMessage("You are not verified")
      }
    }
  }, [publicKey?.toBase58()])

  const detectNftProgress = (num) => {
    setNFTcreateProgress(num)
    console.log(num)
  }

  const mint = async (userInfo) => {
    var ele = document.getElementById('passport')
    var newOne = document.createElement('div');

    var imageHtml = document.getElementById('passport-image')

    const canvas = await html2canvas(!ele ? newOne : ele)
    const dataURL = await canvas.toDataURL("image/jpeg", 1.0);
    let tempFiles = files;
    var blobBin = atob(dataURL.split(',')[1]);

    var arr: any[] = [];
    for (var i = 0; i < blobBin.length; i++) {
      arr.push(blobBin.charCodeAt(i));
    }
    // var file=new File([], {type: 'image/png'});

    tempFiles[0] = new File([new Uint8Array(arr)], "passport.jpg", { type: "image/jpeg" });
    setFiles(tempFiles);

    // let tempUser
    // await axios.get(`https://solarity-server.herokuapp.com/api/users/tmeta?includeDao=true`)
    //   .then(response => {
    //     console.log("response data: ", response.data)
    //     tempUser = response.data.user
    //   })
    //   .catch(error => {
    //     console.log(error)
    //   })
    // return;
    let metadata = {
      name: userInfo.username,
      symbol: "PASSPORT",
      creators: [new Creator({
        address: userInfo.solanaAddress,
        verified: true,
        share: 100
      })],
      collection: "",
      description: userInfo.bio,
      sellerFeeBasisPoints: 0,
      image: userInfo.profileImage.link,
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

    setMinting(true);
    // setTimeout(() => {

    // }, 3000);
    // return;
    try {
      // I used the same frontend for nft mint and update.
      const _nft = await mintNFT(
        // const _nft = await updateNFT(
        connection,
        wallet,
        endpoint.name,
        files,
        metadata,
        detectNftProgress,
        attributes.properties?.maxSupply,
      );
      if (_nft) setNft(_nft);
      console.log("newNFT", _nft)

      await updateNftAddress(userInfo._id, _nft?.mintKey)

      setAlertMessage('');
    } catch (e: any) {
      setAlertMessage(e.message);
    } finally {
      setMinting(false);
    }
  };

  // if (!wallet || !publicKey) {
  //   return null;
  // }

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
            setPassportWidth={setPassportWidth}
            setPassportHeight={setPassportHeight}
            onMint={mint}
            isMinting={isMinting}
          />
        </Col>
      </Row>
      <MetaplexOverlay visible={nftCreateProgress === 9}>
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
        <Button onClick={() => history.push('/mint')}>
          Back to Create NFT
        </Button>
      </>
    );
  }

  const backTo = () => {
    window.location.href = baseUrl
  }

  const goToProfile = () => {
    history.push('/profile')
    // router.push({
    //   pathname: '/profile'
    // })
  }

  return (
    <>
      <div className="waiting-title">Congratulations, you created an NFT!</div>
      <div className="congrats-button-container">
        <Button
          className="metaplex-button"
          onClick={backTo}
        >
          <span>Back to Home Page</span>
          <span>&gt;</span>
        </Button>
        {/* <Button
          className="metaplex-button"
          onClick={goToProfile}
        >
          <>
            <span>Update Profile Page</span>
            <span>&gt;</span>
          </>
        </Button> */}
      </div>
      {/* <Confetti /> */}
    </>
  );
};

const PassportCard = (props) => {
  const { user, address, setPassportWidth, setPassportHeight, onMint, isMinting } = props;
  const passportRef: React.MutableRefObject<any> = useRef()

  // useEffect(() => {
  //   getPassportSize()
  //   window.addEventListener("resize", getPassportSize)
  // }, [])

  // const getPassportSize = () => {
  //   console.log('here')

  //   const newWidth = passportRef.current.clientWidth;
  //   setPassportWidth(newWidth);

  //   const newHeight = passportRef.current.clientHeight;
  //   setPassportHeight(newHeight);
  // }

  // useEffect(() => {
  //   if (user) {
  //     onMint(user)
  //   }
  // }, [user])

  const isProfileImageLoaded = () => {
    // onMint(user)
  }

  const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <>
      {/* <button onClick={() => onMint(user)}>Mint</button> */}
      <div className='passport-wrapper'>
        <div className='passport-header'>
          <h1 className='passport-title'>Minting Passport</h1>
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
                      <Image src={user.profileImage?.link} width={150} height={150} onLoad={isProfileImageLoaded} />
                    </div>
                  </div>
                  <div className='passport-domain'>
                    {user?.username}
                  </div>
                  <div className='passport-title'>
                    {user?.bio}
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
              <>
                <div className='no-userdata'>
                  There is no data. Please register first.
                </div>
                <div style={{textAlign: "center"}}><a href={baseUrl} style={{fontSize: '18px', color: "white"}}>Back</a></div>
              </>
          }
        </div>
      </div>
    </>
  )
}

const getUserInfo = async (address) => {
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

const updateNftAddress = async (userId, nftAddress) => {
  if (!nftAddress) return;

  try {
    const payload = {
      userId,
      nftAddress
    }

    const {
      data: data,
    } = await apiCaller.post(`/profile/updateNft`, payload)


  } catch (err) {
    console.log(err)
  }
}