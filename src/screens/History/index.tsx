import { useEffect, useRef, useState } from 'react';
import Animated, { BounceInRight, LinearTransition, SlideOutLeft } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';
import { View, ScrollView, Alert, Pressable } from 'react-native';
import { HouseLine, Trash } from 'phosphor-react-native';

import { Header } from '../../components/Header';
import { HistoryCard, HistoryProps } from '../../components/HistoryCard';

import { styles } from './styles';
import { THEME } from '../../styles/theme';

import { historyGetAll, historyRemove } from '../../storage/quizHistoryStorage';
import { Loading } from '../../components/Loading';

export function History() {
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<HistoryProps[]>([]);

  const { goBack } = useNavigation();

  const SwipeableRefs = useRef<Swipeable[]>([]);
  
  async function fetchHistory() {
    const response = await historyGetAll();
    setHistory(response);
    setIsLoading(false);
  }

  async function remove(id: string) {
    await historyRemove(id);

    fetchHistory();
  }

  function handleRemove(id: string, index: number) {
    SwipeableRefs.current?.[index].close();
    Alert.alert(
      'Remover',
      'Deseja remover esse registro?',
      [
        {
          text: 'Sim', onPress: () => remove(id)
        },
        { text: 'Não', style: 'cancel' }
      ]
    );

  }

  useEffect(() => {
    fetchHistory();
  }, []);

  if (isLoading) {
    return <Loading />
  }

  return (
    <View style={styles.container}>
      <Header
        title="Histórico"
        subtitle={`Seu histórico de estudos${'\n'}realizados`}
        icon={HouseLine}
        onPress={goBack}
      />

      <ScrollView
        contentContainerStyle={styles.history}
        showsVerticalScrollIndicator={false}
      >
        {
          history.map((item, index) => (
            <Animated.View 
              key={item.id}
              entering={BounceInRight.delay(100)}
              exiting={SlideOutLeft.delay(100)}
              layout={LinearTransition.springify()}
              
              >
            {/* <TouchableOpacity
              onPress={() => handleRemove(item.id)}
            > */}
            <Swipeable
              ref={(ref) => {
                if (ref) {
                  SwipeableRefs.current.push(ref);
                }
              }}
              overshootLeft={false}
              containerStyle={{ backgroundColor: THEME.COLORS.GREY_800 }}
              renderLeftActions={() => (
                <Pressable 
                  style={styles.swipeableRemove}
                  onPress={() => handleRemove(item.id, index)}
                  >
                  <Trash size={32} color={THEME.COLORS.GREY_100} />
                </Pressable>
          )}>
              <HistoryCard data={item} />
              </Swipeable>
            {/* </TouchableOpacity> */}
            </Animated.View>
          ))
        }
      </ScrollView>
    </View>
  );
}