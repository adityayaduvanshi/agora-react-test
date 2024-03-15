import { CSSProperties, useState } from "react";
import {
  AgoraRTCProvider,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
  useRTCClient,
  useRemoteAudioTracks,
  useRemoteUsers,
  RemoteUser,
  LocalVideoTrack,
  useClientEvent,
} from "agora-rtc-react";
import AgoraRTC, { ILocalAudioTrack, ILocalVideoTrack } from "agora-rtc-sdk-ng";
import "./App.css";

function App() {
  const client = useRTCClient(AgoraRTC.createClient({ codec: "vp8", mode: "rtc" }));
  const [channelName, setChannelName] = useState("test");
  const [AppID, setAppID] = useState("");
  const [token, setToken] = useState("");
  const [userName, setUserName] = useState("");
  const [inCall, setInCall] = useState(false);

  return (
    <div style={styles.container}>
      <h1>Agora React Videocall</h1>
      {!inCall ? (
        <Form
          AppID={AppID}
          setAppID={setAppID}
          channelName={channelName}
          setChannelName={setChannelName}
          token={token}
          setToken={setToken}
          setInCall={setInCall}
          userName={userName}
          setUserName={setUserName}
        />
      ) : (
        <AgoraRTCProvider client={client}>
          <Videos channelName={channelName} AppID={AppID} token={token} userName={userName} />
          <br />
          <button onClick={() => setInCall(false)}>End Call</button>
        </AgoraRTCProvider>
      )}
    </div>
  );
}

function Videos(props: { channelName: string; AppID: string; token: string; userName: string }) {
  const { AppID, channelName, token, userName } = props;
  const { isLoading: isLoadingMic, localMicrophoneTrack } = useLocalMicrophoneTrack();
  const { isLoading: isLoadingCam, localCameraTrack } = useLocalCameraTrack();
  const remoteUsers = useRemoteUsers();
  const { audioTracks } = useRemoteAudioTracks(remoteUsers);

  const client = useRTCClient();
  useClientEvent(client, "user-published", (user) => {
    console.log(user);
  });

  usePublish([localMicrophoneTrack, localCameraTrack]);

  useJoin({
    appid: AppID,
    channel: channelName,
    token: null,
    uid: userName,
  });

  audioTracks.map((track) => track.play());

  const deviceLoading = isLoadingMic || isLoadingCam;
  if (deviceLoading) return <div style={styles.grid}>Loading devices...</div>;

  const deviceUnavailable = !localCameraTrack || !localMicrophoneTrack;
  if (deviceUnavailable) return <div style={styles.grid}>Please allow camera and microphone permissions</div>;
  console.log(remoteUsers);
  return (
    <>
      <div style={{ ...styles.grid, ...returnGrid(remoteUsers) }}>
        <LocalVideoTrack track={localCameraTrack} play={true} style={styles.gridCell} />
        {remoteUsers.map((user) => (
          <div>
            <RemoteUser user={user} style={styles.gridCell} />
            <p>UID: {user.uid}</p>
          </div>
        ))}
      </div>
      <br />
      <Controls localMicrophoneTrack={localMicrophoneTrack} localCameraTrack={localCameraTrack} />
    </>
  );
}

const Controls = (props: { localMicrophoneTrack: ILocalAudioTrack; localCameraTrack: ILocalVideoTrack }) => {
  const { localMicrophoneTrack, localCameraTrack } = props;
  return (
    <div style={styles.btnContainer}>
      <button onClick={() => void localMicrophoneTrack.setMuted(!localMicrophoneTrack.muted)}>Mute Mic</button>
      <button onClick={() => void localCameraTrack.setMuted(!localCameraTrack.muted)}>Mute Cam</button>
    </div>
  );
};

/* Standard form to enter AppID and Channel Name */
function Form(props: {
  AppID: string;
  setAppID: React.Dispatch<React.SetStateAction<string>>;
  channelName: string;
  setChannelName: React.Dispatch<React.SetStateAction<string>>;
  token: string;
  setToken: React.Dispatch<React.SetStateAction<string>>;
  setInCall: React.Dispatch<React.SetStateAction<boolean>>;
  setUserName: React.Dispatch<React.SetStateAction<string>>;
  userName: string;
}) {
  const { AppID, setAppID, channelName, setChannelName, token, setToken, setInCall, setUserName, userName } = props;
  return (
    <div>
      <p>Please enter your Agora AppID and Channel Name</p>
      <label htmlFor="appid">Agora App ID: </label>
      <input id="appid" type="text" value={AppID} onChange={(e) => setAppID(e.target.value)} placeholder="required" />
      <br />
      <label htmlFor="channel">Channel Name: </label>
      <input
        id="channel"
        type="text"
        value={channelName}
        onChange={(e) => setChannelName(e.target.value)}
        placeholder="required"
      />
      <label htmlFor="userName">User Name: </label>
      <input
        id="uname"
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="required"
      />
      <br />
      <label htmlFor="token">Channel Token: </label>
      <input id="token" type="text" value={token} onChange={(e) => setToken(e.target.value)} placeholder="optional" />
      <br />
      <button
        onClick={() => (AppID && channelName ? setInCall(true) : alert("Please enter Agora App ID and Channel Name"))}
      >
        Join
      </button>
    </div>
  );
}

export default App;

/* Style Utils */
const returnGrid = (remoteUsers: Array<unknown>) => {
  return {
    gridTemplateColumns:
      remoteUsers.length > 8
        ? unit.repeat(4)
        : remoteUsers.length > 3
        ? unit.repeat(3)
        : remoteUsers.length > 0
        ? unit.repeat(2)
        : unit,
  };
};
const unit = "minmax(0, 1fr) ";
const styles = {
  grid: {
    width: "100%",
    height: "100%",
    display: "grid",
  },
  gridCell: { height: "100%", width: "100%" },
  container: {
    display: "flex",
    flexDirection: "column" as CSSProperties["flexDirection"],
    flex: 1,
    justifyContent: "center",
  },
  btnContainer: {
    display: "flex",
    flexDirection: "row" as CSSProperties["flexDirection"],
    alignSelf: "center",
    width: "50%",
    justifyContent: "space-evenly",
  },
};
