import { createContext, useState, ReactNode, useEffect } from 'react';
import Cookies from 'js-cookie';
import challenges from '../../challenges.json';
import { LevelUpModal } from '../components/LevelUpModal';


interface Challenge {
    type: 'body' | 'eye';
    description: string;
    amount: number;
}


interface ChallengesContextData {
        level: number;
        currentExeperience: number;
        challengesCompleted: number;
        activeChallenge: Challenge;
        levelUp: () => void;
        startNewChallenge: () => void;
        resetChallenge: () => void;
        experienceToNextLevel: number;
        completeChallenge: () => void;
        closeLevelUpModal: () => void;
        
}

interface ChallengesProviderProps {
    children: ReactNode;
    level: number;
    currentExeperience: number;
    challengesCompleted: number;
}

export const ChallengesContext = createContext({} as ChallengesContextData );

export function ChallengesProvider({ children, ...rest }: ChallengesProviderProps) {
    const [level, setLevel] = useState(rest.level ?? 1);
    const [currentExeperience, setCurrentExperience] = useState(rest.currentExeperience ?? 0);
    const [challengesCompleted, setChallengesCompleted] = useState(rest.challengesCompleted ?? 0);

    const [activeChallenge, setActiveChallenge] = useState(null);
    const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);

    const experienceToNextLevel = Math.pow((level + 1) * 4, 2);

    useEffect(() => {
      Notification.requestPermission();
    }, [])

    useEffect(() => {
      Cookies.set('level', String(level));
      Cookies.set('currentExperience', String(currentExeperience));
      Cookies.set('challengesCompleted', String(challengesCompleted));
    },[level, currentExeperience, challengesCompleted]);

    function levelUp() {
      setLevel(level + 1);
      setIsLevelModalOpen(true)
    }

    function closeLevelUpModal() {
      setIsLevelModalOpen(false);
    }

    function startNewChallenge() {
        const randomChallengeIndex = Math.floor(Math.random() * challenges.length);
        const challenge = challenges[randomChallengeIndex];

        setActiveChallenge(challenge)

        new Audio('/notification.mp3').play();

        if (Notification.permission === 'granted') {
          new Notification('Novo desafio', {
            body: `Valendo ${challenge.amount}xp!`
          })
        }
    }

    function resetChallenge() {
        setActiveChallenge(null);
    }

    function completeChallenge() {
      if (!activeChallenge) {
        return; 
      }

      const { amount } = activeChallenge;

      let finalExperience = currentExeperience + amount;

      if (finalExperience >= experienceToNextLevel) {
        finalExperience = finalExperience - experienceToNextLevel;  
        levelUp();
      }   
        setCurrentExperience(finalExperience);
        setActiveChallenge(null);
        setChallengesCompleted(challengesCompleted + 1);
    }
    
    return (
        <ChallengesContext.Provider value={{
            level, 
            currentExeperience, 
            challengesCompleted,
            levelUp, 
            startNewChallenge,
            activeChallenge,
            resetChallenge,
            experienceToNextLevel,
            completeChallenge,
            closeLevelUpModal,

            }} >
            { children }

         { isLevelModalOpen && <LevelUpModal />}
        </ChallengesContext.Provider>
    );
}