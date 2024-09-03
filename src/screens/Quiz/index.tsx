import { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import Animated, 
      { Extrapolation, 
        interpolate, 
        useAnimatedScrollHandler, 
        useAnimatedStyle, 
        useSharedValue, 
        withSequence, 
        withTiming,
        runOnJS
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { useNavigation, useRoute } from '@react-navigation/native';

import { styles } from './styles';
import { THEME } from '../../styles/theme';

import { QUIZ } from '../../data/quiz';
import { historyAdd } from '../../storage/quizHistoryStorage';

import { Loading } from '../../components/Loading';
import { Question } from '../../components/Question';
import { QuizHeader } from '../../components/QuizHeader';
import { ConfirmButton } from '../../components/ConfirmButton';
import { OutlineButton } from '../../components/OutlineButton';
import { ProgressBar } from '../../components/ProgressBar';


interface Params {
  id: string;
}

type QuizProps = typeof QUIZ[0];

const CARD_INCLINATION = 10;
const CARD_SKIP_AREA = -200;

export function Quiz() {
  const [points, setPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quiz, setQuiz] = useState<QuizProps>({} as QuizProps);
  const [alternativeSelected, setAlternativeSelected] = useState<null | number>(null);

  const shake = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const cardPosition = useSharedValue(0);

  const shakeStyleAnimated = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shake.value }]
    }
  });

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    }
  });

  const fixedProgressBarStyle = useAnimatedStyle(() => {
    return {
      zIndex: 1,
      position: 'absolute',
      paddingTop: 50,
      backgroundColor: THEME.COLORS.GREY_500,
      width: '110%',
      left: '-5%',
      opacity: interpolate(scrollY.value, [50, 90], [0, 1], Extrapolation.CLAMP),
      transform: [{ translateY: interpolate(scrollY.value, [50, 100], [-40, 0], Extrapolation.CLAMP) }]
    }
  });

  const headerStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [60, 90], [1, 0], Extrapolation.CLAMP),
    }
  });

  const onPan = Gesture.Pan().activateAfterLongPress(200).onUpdate((event) => {
    const moveToLeft = event.translationX < 0;

    if(moveToLeft) {
    cardPosition.value = event.translationX;
    }
  }).onEnd((event) => {
    if(event.translationX < CARD_SKIP_AREA) {
      runOnJS(handleSkipConfirm)();
    }
    cardPosition.value = withTiming(0);
  });

  const dragStyles = useAnimatedStyle(() => {
    const rotateZ = cardPosition.value / CARD_INCLINATION;
    return {
      transform: [
        { translateX: cardPosition.value },
        { rotateZ: `${rotateZ}deg` }
      ]
    }
  });


  const { navigate } = useNavigation();

  const route = useRoute();
  const { id } = route.params as Params;


  function shakeAnimation() {
    shake.value = withSequence(withTiming(10, { duration: 100 }), withTiming(-10, { duration: 100 }), withTiming(10, { duration: 100 }), withTiming(-10, { duration: 100 }), withTiming(0, { duration: 100 }));
    };

  function handleSkipConfirm() {
    Alert.alert('Pular', 'Deseja realmente pular a questão?', [
      { text: 'Sim', onPress: () => handleNextQuestion() },
      { text: 'Não', onPress: () => { } }
    ]);
  }

  async function handleFinished() {
    await historyAdd({
      id: new Date().getTime().toString(),
      title: quiz.title,
      level: quiz.level,
      points,
      questions: quiz.questions.length
    });

    navigate('finish', {
      points: String(points),
      total: String(quiz.questions.length),
    });
  }

  function handleNextQuestion() {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prevState => prevState + 1)
    } else {
      handleFinished();
    }
  }

  async function handleConfirm() {
    if (alternativeSelected === null) {
      //return handleSkipConfirm();
    }

    if (quiz.questions[currentQuestion].correct === alternativeSelected) {
      setPoints(prevState => prevState + 1);
    } else {
      shakeAnimation();
    }
    setAlternativeSelected(null);
  }

  function handleStop() {
    Alert.alert('Parar', 'Deseja parar agora?', [
      {
        text: 'Não',
        style: 'cancel',
      },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: () => navigate('home')
      },
    ]);

    return true;
  }

  useEffect(() => {
    const quizSelected = QUIZ.filter(item => item.id === id)[0];
    setQuiz(quizSelected);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (quiz.questions) {
      handleNextQuestion();
    }
  }, [points]);

  if (isLoading) {
    return <Loading />
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={fixedProgressBarStyle}
        >
        <Text
          style={styles.title}
          >{quiz.title}</Text>
        <ProgressBar
          total={quiz.questions.length}
          current={currentQuestion + 1}
        />
      </Animated.View>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.question}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
      <Animated.View style={[styles.header, headerStyles]}>
        <QuizHeader
          title={quiz.title}
          currentQuestion={currentQuestion + 1}
          totalOfQuestions={quiz.questions.length}
        />
      </Animated.View>
      <GestureDetector
        gesture={onPan}
      >
      <Animated.View style={[shakeStyleAnimated, dragStyles]}>
        <Question
          key={quiz.questions[currentQuestion].title}
          question={quiz.questions[currentQuestion]}
          alternativeSelected={alternativeSelected}
          setAlternativeSelected={setAlternativeSelected}
        />
      </Animated.View>
      </GestureDetector>

        <View style={styles.footer}>
          <OutlineButton title="Parar" onPress={handleStop} />
          <ConfirmButton onPress={handleConfirm} />
        </View>
      </Animated.ScrollView>
    </View >
  );
}