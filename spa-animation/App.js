import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  User, 
  Server, 
  Globe, 
  Database, 
  ArrowUp, 
  ArrowDown, 
  ArrowRight, 
  ArrowLeft, 
  Circle 
} from 'lucide-react';

// NodeComponent: Represents each node in the flow
const NodeComponent = ({ icon: Icon, label, x, y, highlighted, highlightedColor = '#4CAF50' }) => (
  <div style={{ 
    position: 'absolute', 
    left: x, 
    top: y, 
    textAlign: 'center', 
    transition: 'all 0.3s' 
  }}>
    <div style={{ 
      backgroundColor: highlighted ? highlightedColor : '#f0f0f0', 
      borderRadius: '50%', 
      width: '60px', 
      height: '60px', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      transition: 'all 0.3s'
    }}>
      <Icon size={30} color={highlighted ? 'white' : 'black'} />
    </div>
    <div style={{ marginTop: '5px' }}>{label}</div>
  </div>
);

// ArrowComponent: Represents the arrows between nodes
const ArrowComponent = ({ start, end, direction, progress }) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  const length = Math.sqrt(dx * dx + dy * dy);

  let ArrowIcon;
  switch(direction) {
    case 'up': ArrowIcon = ArrowUp; break;
    case 'down': ArrowIcon = ArrowDown; break;
    case 'left': ArrowIcon = ArrowLeft; break;
    default: ArrowIcon = ArrowRight;
  }

  return (
    <>
      <div style={{
        position: 'absolute',
        left: start.x,
        top: start.y,
        width: `${length * progress}px`,
        height: '2px',
        backgroundColor: '#007BFF',
        transform: `rotate(${angle}deg)`,
        transformOrigin: '0 0',
        transition: 'all 0.3s'
      }} />
      <ArrowIcon 
        style={{
          position: 'absolute',
          left: start.x + dx * progress - 10,
          top: start.y + dy * progress - 10,
          transition: 'all 0.3s'
        }} 
        size={20} 
        color="#007BFF" 
      />
    </>
  );
};

// DataComponent: Represents the red dot indicating data flow
const DataComponent = ({ currentStep, scenario, steps, nodes }) => {
  let position = {x: 0, y: 0};

  if (scenario === 'failure') {
    if (currentStep <= 4 ) { // Steps 0-4: Animate up to IdP
      const step = steps[currentStep];
      if (step) {
        const toNode = nodes[step.to];
        position = { x: toNode.x + 20, y: toNode.y + 20 };
      }
    } else { // Steps 5-7: Keep red dot at IdP
      const idp = nodes.find(node => node.label === 'IdP');
      position = { x: idp.x + 20, y: idp.y + 20 };
    }
  } else { // Success scenario
    if (currentStep >= 13 && currentStep <=14 ) { // Steps 13-14: Animate from Backend to Client
      const client = nodes.find(node => node.label === 'Client');
      const backend = nodes.find(node => node.label === 'Back-end');
      const t = (currentStep -13)/1; // Progress: 0 to 1
      position = {
        x: backend.x + 20 + (client.x - backend.x)*t,
        y: backend.y + 20 + (client.y - backend.y)*t
      };
    } else {
      const step = steps[currentStep];
      if (step) {
        const toNode = nodes[step.to];
        position = { x: toNode.x + 20, y: toNode.y + 20 };
      }
    }
  }

  return (
    <Circle
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        transition: 'all 1s linear'
      }}
      size={20}
      color="red"
      fill="red"
    />
  );
};

// ZeroTrustFlowVisualization: Main visualization component
const ZeroTrustFlowVisualization = ({ currentStep, scenario }) => {
  const [arrowProgress, setArrowProgress] = useState(0);

  // Define all nodes with their positions
  const nodes = [
    { icon: User, label: 'Client', x: 50, y: 150 },
    { icon: Globe, label: 'Front-end', x: 200, y: 150 },
    { icon: Shield, label: 'Firewall', x: 350, y: 150 },
    { icon: Server, label: 'PDP', x: 500, y: 150 },
    { icon: Lock, label: 'IdP', x: 500, y: 300 },
    { icon: Server, label: 'PEP', x: 650, y: 150 },
    { icon: Database, label: 'Back-end', x: 800, y: 150 },
  ];

  // Define all steps in the communication flow
  const successSteps = [
    { from: 0, to: 1, direction: 'right' }, // 0: Client to Front-end
    { from: 1, to: 2, direction: 'right' }, // 1: Front-end to Firewall
    { from: 2, to: 3, direction: 'right' }, // 2: Firewall to PDP
    { from: 3, to: 4, direction: 'down' },  // 3: PDP to IdP
    { from: 4, to: 3, direction: 'up' },    // 4: IdP to PDP (success)
    { from: 3, to: 5, direction: 'right' }, // 5: PDP to PEP
    { from: 5, to: 2, direction: 'right' }, // 6: PEP to Firewall
    { from: 2, to: 6, direction: 'right' }, // 7: Firewall to Backend
    { from: 6, to: 2, direction: 'left' },  // 8: Backend to Firewall
    { from: 2, to: 1, direction: 'left' },  // 9: Firewall to Front-end
    { from: 1, to: 0, direction: 'left' },  //10: Front-end to Client
    { from: 0, to: 1, direction: 'right' }, //11: Client to Front-end
    { from: 1, to: 2, direction: 'right' }, //12: Front-end to Firewall
    { from: 2, to: 6, direction: 'right' }, //13: Firewall to Backend
    { from: 6, to: 0, direction: 'left' },  //14: Backend to Client (start data flow)
    { from: 6, to: 0, direction: 'left' },  //15: Backend to Client (data arrives)
  ];

  const failureSteps = [
    { from: 0, to: 1, direction: 'right' }, // 0: Client to Front-end
    { from: 1, to: 2, direction: 'right' }, // 1: Front-end to Firewall
    { from: 2, to: 3, direction: 'right' }, // 2: Firewall to PDP
    { from: 3, to: 4, direction: 'down' },  // 3: PDP to IdP
    { from: 4, to: 3, direction: 'up' },    // 4: IdP to PDP (failure)
    { from: 3, to: 2, direction: 'left' },  // 5: PDP to Firewall
    { from: 2, to: 1, direction: 'left' },  // 6: Firewall to Front-end
    { from: 1, to: 0, direction: 'left' },  // 7: Front-end to Client (rejected)
  ];

  // Choose the appropriate steps based on the scenario
  const steps = scenario === 'success' ? successSteps : failureSteps;

  // Reset and set arrow progress whenever currentStep changes
  useEffect(() => {
    setArrowProgress(0);
    const timer = setTimeout(() => setArrowProgress(1), 50);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const currentFlow = steps[currentStep] || { from: -1, to: -1 };

  return (
    <div style={{ 
      position: 'relative', 
      width: '900px', 
      height: '350px', 
      border: '1px solid #ccc', 
      margin: '0 auto' 
    }}>
      {nodes.map((node, index) => {
        let highlighted = false;
        let highlightedColor = '#4CAF50'; // Default green

        if (index === 2) { // Firewall node
          highlighted = true;
          if (scenario === 'success') {
            // Firewall turns green between steps 5-6 in success
            highlightedColor = currentStep >= 5 && currentStep <= 6 ? '#4CAF50' : '#FF0000';
          } else {
            // Firewall remains red in failure
            highlightedColor = '#FF0000';
          }
        } else {
          // Highlight if involved in current flow
          if (index === currentFlow.from || index === currentFlow.to) {
            highlighted = true;
          }

          // Highlight if involved in data flow (steps 13 and 14 in success)
          if (scenario === 'success' && currentStep >= 13 && [0, 1, 2, 6].includes(index)) {
            highlighted = true;
          }

          // Highlight if involved in failure flow (steps 0-7 in failure)
          if (scenario === 'failure' && currentStep >= 0 && currentStep <= 7 && [0,1,2,3,4,5,6,7].includes(index)) {
            highlighted = true;
          }

          // Additionally, highlight Client in failure
          if (scenario === 'failure' && currentStep === 7 && index === 0) {
            highlighted = true;
          }
        }

        // For failure scenario, highlight Client in red at the end
        if (scenario === 'failure' && currentStep === 7 && index === 0) {
          highlightedColor = '#FF0000'; // Red for rejection
        }

        return (
          <NodeComponent
            key={index}
            {...node}
            highlighted={highlighted}
            highlightedColor={highlightedColor}
          />
        );
      })}
      {/* Render arrow if valid flow */}
      {currentFlow.from !== -1 && (
        <ArrowComponent
          start={nodes[currentFlow.from]}
          end={nodes[currentFlow.to]}
          direction={currentFlow.direction}
          progress={arrowProgress}
        />
      )}
      {/* Render data dot based on scenario */}
      <DataComponent currentStep={currentStep} scenario={scenario} steps={steps} nodes={nodes} />
      {/* Render final direct arrow from Backend to Client at steps 14 and 15 in success */}
      {scenario === 'success' && (currentStep === 14 || currentStep === 15) && (
        <ArrowComponent
          start={nodes.find(node => node.label === 'Back-end')}
          end={nodes.find(node => node.label === 'Client')}
          direction='left'
          progress={1} // Full arrow
        />
      )}
      {/* Render final direct line from Backend to Client at steps 14 and 15 in success */}
      {scenario === 'success' && (currentStep === 14 || currentStep === 15) && (
        <div style={{
          position: 'absolute',
          left: nodes.find(node => node.label === 'Back-end').x,
          top: nodes.find(node => node.label === 'Back-end').y + 30,
          width: nodes.find(node => node.label === 'Client').x - nodes.find(node => node.label === 'Back-end').x,
          height: '2px',
          backgroundColor: '#4CAF50',
          transform: `rotate(${Math.atan2(
            nodes.find(node => node.label === 'Client').y - nodes.find(node => node.label === 'Back-end').y,
            nodes.find(node => node.label === 'Client').x - nodes.find(node => node.label === 'Back-end').x
          ) * 180 / Math.PI}deg)`,
          transformOrigin: '0 0',
          zIndex: -1
        }} />
      )}
    </div>
  );
};

// App Component: Main application
function App() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [requireMfa, setRequireMfa] = useState(false);
  const [status, setStatus] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [scenario, setScenario] = useState('success'); // 'success' or 'failure'

  // Handle login button click
  const handleLogin = () => {
    if (username === 'admin' && password === 'password') {
      setRequireMfa(true);
      setStatus('MFA required');
      setScenario('success');
    } else {
      setRequireMfa(false);
      setStatus('Login failed');
      setScenario('failure');
      animateFailureProcess();
    }
  };

  // Handle MFA submission
  const handleMfaSubmit = () => {
    if (mfaCode === '123456') {
      setStatus('Login successful');
      animateLoginProcess();
    } else {
      setStatus('MFA verification failed');
      setScenario('failure');
      animateFailureProcess();
    }
  };

  // Animate the login process through success steps
  const animateLoginProcess = () => {
    setIsAnimating(true);
    setCurrentStep(-1); // Reset to initial state
    const totalSteps = 15; // Total number of steps (0 to 15)

    for (let i = 0; i <= totalSteps; i++) {
      setTimeout(() => {
        setCurrentStep(i);
        if (i === totalSteps) {
          setIsAnimating(false);
          setStatus('Access granted. Data retrieved from backend and returned to client.');
        }
      }, i * 1000); // 1 second per step
    }
  };

  // Animate the failure process through failure steps
  const animateFailureProcess = () => {
    setIsAnimating(true);
    setCurrentStep(-1); // Reset to initial state
    const totalSteps = 7; // Total number of steps (0 to 7)

    for (let i = 0; i <= totalSteps; i++) {
      setTimeout(() => {
        setCurrentStep(i);
        if (i === totalSteps) {
          setIsAnimating(false);
          setStatus('Access denied. Authentication failed.');
        }
      }, i * 1000); // 1 second per step
    }
  };

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      padding: '20px', 
      maxWidth: '1000px', 
      margin: '0 auto' 
    }}>
      <h1 style={{ textAlign: 'center' }}>Zero Trust Architecture Demo</h1>
      <ZeroTrustFlowVisualization currentStep={currentStep} scenario={scenario} />
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="Username" 
          style={{ 
            marginRight: '10px', 
            padding: '8px', 
            width: '150px', 
            borderRadius: '4px', 
            border: '1px solid #ccc' 
          }}
          disabled={isAnimating}
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password" 
          style={{ 
            marginRight: '10px', 
            padding: '8px', 
            width: '150px', 
            borderRadius: '4px', 
            border: '1px solid #ccc' 
          }}
          disabled={isAnimating}
        />
        <button 
          onClick={handleLogin} 
          disabled={isAnimating} 
          style={{ 
            padding: '8px 16px', 
            cursor: isAnimating ? 'not-allowed' : 'pointer',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#007BFF',
            color: 'white'
          }}
        >
          Login
        </button>
      </div>
      {requireMfa && scenario === 'success' && (
        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <input 
            type="text" 
            value={mfaCode} 
            onChange={(e) => setMfaCode(e.target.value)} 
            placeholder="MFA Code" 
            style={{ 
              marginRight: '10px', 
              padding: '8px', 
              width: '150px', 
              borderRadius: '4px', 
              border: '1px solid #ccc' 
            }}
            disabled={isAnimating}
          />
          <button 
            onClick={handleMfaSubmit} 
            disabled={isAnimating} 
            style={{ 
              padding: '8px 16px', 
              cursor: isAnimating ? 'not-allowed' : 'pointer',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#28A745',
              color: 'white'
            }}
          >
            Submit MFA
          </button>
        </div>
      )}
      <div style={{ 
        marginTop: '10px', 
        textAlign: 'center', 
        color: status.includes('failed') ? 'red' : 'green' 
      }}>
        {status}
      </div>
    </div>
  );
}

export default App;
