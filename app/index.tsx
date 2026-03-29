import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  ActivityIndicator,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { ArchiveItem, ViewType, AppState } from '../src/types';
import { archiveService } from '../src/services/archiveService';

export default function HomeScreen() {
  const [state, setState] = useState<AppState>(() => ({
    currentView: 'dossier',
    selectedItem: null,
    vault: [],
    isHandshakeComplete: false,
    isBiometricVerified: false,
  }));

  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nodeID] = useState(Math.random().toString(36).substring(7).toUpperCase());

  const fetchItems = useCallback(async (query?: string, shouldSearch: boolean = true) => {
    if (!shouldSearch && !query) {
      setIsLoading(true);
      try {
        const results = await archiveService.search();
        setItems(results);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!query?.trim()) return;

    setIsLoading(true);
    try {
      const results = await archiveService.search(query);
      setItems(results);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadVault = async () => {
      try {
        const savedVault = await AsyncStorage.getItem('archive_vault');
        if (savedVault) {
          setState(prev => ({ ...prev, vault: JSON.parse(savedVault) }));
        }
      } catch (error) {
        console.error('Error loading vault:', error);
      }
    };

    loadVault();
    fetchItems(undefined, false);
  }, [fetchItems]);

  const handleAddToVault = async (item: ArchiveItem) => {
    const newVault = [...state.vault, item];
    setState(prev => ({ ...prev, vault: newVault }));
    await AsyncStorage.setItem('archive_vault', JSON.stringify(newVault));
  };

  const renderStoryButton = (topic: string) => (
    <TouchableOpacity
      key={topic}
      onPress={() => fetchItems(topic, true)}
      className="flex items-center mr-4"
    >
      <View className="w-16 h-16 rounded-full border-2 border-cyan-400 bg-black justify-center items-center">
        <Image
          source={{ uri: `https://picsum.photos/seed/${topic}/100/100` }}
          className="w-full h-full rounded-full opacity-60"
        />
      </View>
      <Text className="text-xs text-white/40 mt-2 text-center max-w-16">{topic}</Text>
    </TouchableOpacity>
  );

  const renderItemCard = ({ item }: { item: ArchiveItem }) => (
    <TouchableOpacity
      onPress={() => setState(prev => ({ ...prev, currentView: 'detail', selectedItem: item }))}
      className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4 mx-4"
    >
      <Image
        source={{ uri: archiveService.getItemImageUrl(item.identifier) }}
        className="w-full h-40 rounded-lg mb-3 bg-black/50"
      />
      <Text className="text-white font-semibold text-sm mb-1" numberOfLines={2}>
        {item.title}
      </Text>
      <Text className="text-white/60 text-xs mb-3" numberOfLines={2}>
        {item.description || 'No description'}
      </Text>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <MaterialIcons name="download" size={14} color="#ffffff" />
          <Text className="text-white/60 text-xs ml-1">{item.downloads || 0}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleAddToVault(item)}
          className="bg-cyan-500/20 px-3 py-1 rounded-full"
        >
          <Text className="text-cyan-400 text-xs font-medium">Add to Vault</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (!state.isHandshakeComplete) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <Text className="text-white text-2xl font-bold mb-4">Archive</Text>
        <Text className="text-white/60 text-center px-6 mb-8">
          Initialize neural handshake to access classified archives
        </Text>
        <TouchableOpacity
          onPress={() => setState(prev => ({ ...prev, isHandshakeComplete: true }))}
          className="bg-cyan-500 px-8 py-3 rounded-lg"
        >
          <Text className="text-black font-bold">Initialize</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-4 py-6">
          <Text className="text-white text-2xl font-bold mb-2">Archive Explorer</Text>
          <Text className="text-white/60 text-xs font-mono">Node: {nodeID}</Text>
        </View>

        {/* Search Bar */}
        <View className="px-4 mb-6">
          <View className="flex-row items-center bg-white/5 border border-white/10 rounded-lg px-4 py-3">
            <MaterialIcons name="search" size={20} color="#ffffff" />
            <TextInput
              placeholder="Search archives..."
              placeholderTextColor="#ffffff80"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => fetchItems(searchQuery, true)}
              className="flex-1 ml-2 text-white"
            />
          </View>
        </View>

        {/* Stories Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-6">
          {['UFO_NODE', 'AREA_51', 'VOYNICH', 'MK_ULTRA', 'APOLLO', 'TESLA'].map(renderStoryButton)}
        </ScrollView>

        {/* Items List */}
        {isLoading ? (
          <View className="flex-1 justify-center items-center py-12">
            <ActivityIndicator size="large" color="#00ffff" />
          </View>
        ) : items.length > 0 ? (
          <FlatList
            data={items}
            renderItem={renderItemCard}
            keyExtractor={item => item.identifier}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View className="flex-1 justify-center items-center py-12">
            <MaterialIcons name="inventory-2" size={48} color="#ffffff40" />
            <Text className="text-white/60 mt-4">No archives found</Text>
          </View>
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={state.currentView === 'detail' && !!state.selectedItem}
        onRequestClose={() => setState(prev => ({ ...prev, currentView: 'dossier', selectedItem: null }))}
        animationType="slide"
      >
        {state.selectedItem && (
          <SafeAreaView className="flex-1 bg-black">
            <ScrollView>
              <TouchableOpacity
                onPress={() => setState(prev => ({ ...prev, currentView: 'dossier', selectedItem: null }))}
                className="flex-row items-center px-4 py-4"
              >
                <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
                <Text className="text-white ml-2">Back</Text>
              </TouchableOpacity>

              <Image
                source={{ uri: archiveService.getItemImageUrl(state.selectedItem.identifier) }}
                className="w-full h-80 bg-black/50"
              />

              <View className="px-4 py-6">
                <Text className="text-white text-2xl font-bold mb-4">{state.selectedItem.title}</Text>
                <Text className="text-white/80 text-base leading-6 mb-4">
                  {state.selectedItem.description || 'No description available'}
                </Text>

                <TouchableOpacity
                  onPress={() => handleAddToVault(state.selectedItem!)}
                  className="bg-cyan-500 py-4 rounded-lg mb-4 flex-row items-center justify-center"
                >
                  <MaterialIcons name="vault" size={20} color="#000000" />
                  <Text className="text-black font-bold ml-2">Add to Vault</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}
