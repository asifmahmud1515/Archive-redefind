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
      style={{
        flexDirection: 'column',
        alignItems: 'center',
        marginRight: 16,
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          borderWidth: 2,
          borderColor: '#06b6d4',
          backgroundColor: '#000000',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image
          source={{ uri: `https://picsum.photos/seed/${topic}/100/100` }}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 32,
            opacity: 0.6,
          }}
        />
      </View>
      <Text
        style={{
          fontSize: 12,
          color: 'rgba(255, 255, 255, 0.4)',
          marginTop: 8,
          textAlign: 'center',
          maxWidth: 64,
        }}
      >
        {topic}
      </Text>
    </TouchableOpacity>
  );

  const renderItemCard = ({ item }: { item: ArchiveItem }) => (
    <TouchableOpacity
      onPress={() => setState(prev => ({ ...prev, currentView: 'detail', selectedItem: item }))}
      style={{
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: '600',
          color: '#ffffff',
          marginBottom: 4,
        }}
        numberOfLines={2}
      >
        {item.title}
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: 'rgba(255, 255, 255, 0.6)',
        }}
        numberOfLines={1}
      >
        {item.creator}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#050505',
      }}
    >
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: '#06b6d4',
              letterSpacing: 2,
            }}
          >
            ARCHIVE
          </Text>
        </View>

        {/* Search Bar */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#1a1a1a',
              borderWidth: 1,
              borderColor: 'rgba(6, 182, 212, 0.3)',
              borderRadius: 8,
              paddingHorizontal: 12,
            }}
          >
            <MaterialIcons name="search" size={20} color="rgba(255, 255, 255, 0.4)" />
            <TextInput
              style={{
                flex: 1,
                color: '#ffffff',
                paddingVertical: 10,
                paddingHorizontal: 8,
              }}
              placeholder="Search Archive..."
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => fetchItems(searchQuery, true)}
            />
          </View>
        </View>

        {/* Stories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingHorizontal: 16, paddingVertical: 8 }}
        >
          <View style={{ flexDirection: 'row' }}>
            {['UFO_NODE', 'AREA_51', 'VOYNICH', 'MK_ULTRA', 'APOLLO', 'TESLA'].map(topic =>
              renderStoryButton(topic),
            )}
          </View>
        </ScrollView>

        {/* Content */}
        <ScrollView
          style={{
            flex: 1,
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          {isLoading && items.length === 0 ? (
            <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
              <ActivityIndicator size="large" color="#06b6d4" />
              <Text style={{ color: 'rgba(255, 255, 255, 0.4)', marginTop: 12 }}>
                Searching archive...
              </Text>
            </View>
          ) : items.length > 0 ? (
            <FlatList
              scrollEnabled={false}
              data={items}
              keyExtractor={item => item.identifier}
              renderItem={renderItemCard}
            />
          ) : (
            <View style={{ paddingVertical: 40 }}>
              <Text style={{ color: 'rgba(255, 255, 255, 0.4)', textAlign: 'center' }}>
                No items found. Try searching or selecting a story.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Bottom Navigation */}
      <View
        style={{
          flexDirection: 'row',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.05)',
          backgroundColor: '#0a0a0a',
        }}
      >
        {['dossier', 'explore', 'vault', 'profile'].map(view => (
          <TouchableOpacity
            key={view}
            onPress={() => setState(prev => ({ ...prev, currentView: view as ViewType }))}
            style={{
              flex: 1,
              paddingVertical: 12,
              justifyContent: 'center',
              alignItems: 'center',
              opacity: state.currentView === view ? 1 : 0.5,
            }}
          >
            <MaterialIcons
              name={
                view === 'dossier'
                  ? 'folder'
                  : view === 'explore'
                    ? 'search'
                    : view === 'vault'
                      ? 'security'
                      : 'person'
              }
              size={24}
              color={state.currentView === view ? '#06b6d4' : 'rgba(255, 255, 255, 0.4)'}
            />
            <Text
              style={{
                fontSize: 10,
                color: state.currentView === view ? '#06b6d4' : 'rgba(255, 255, 255, 0.4)',
                marginTop: 4,
                letterSpacing: 1,
              }}
            >
              {view.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}
