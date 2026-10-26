import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const SivapreIconWhite = ({ size = 100 }) => {
    return (
        <View style={{ width: size * 1.5, height: size, alignItems: 'center', justifyContent: 'center' }}>

            {/* 1. Las Ondas de Radar (Laterales) */}
            <View style={styles.radarContainer}>
                <MaterialCommunityIcons name="rss" size={size * 0.7} color="white" style={styles.leftRadar} />
                <MaterialCommunityIcons name="rss" size={size * 0.7} color="white" style={styles.rightRadar} />
            </View>

            {/* 2. El Escudo (Fondo de la parte central) */}
            <MaterialCommunityIcons
                name="shield-outline"
                size={size}
                color="white"
                style={StyleSheet.absoluteFillObject}
            />

            {/* 3. El Zancudo / Insecto (Centro) */}
            <View style={styles.bugContainer}>
                <MaterialCommunityIcons
                    name="bug"
                    size={size * 0.5}
                    color="white"
                />
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    radarContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        position: 'absolute',
    },
    leftRadar: {
        transform: [{ rotate: '-45deg' }],
        opacity: 0.6,
    },
    rightRadar: {
        transform: [{ rotate: '135deg' }],
        opacity: 0.6,
    },
    bugContainer: {
        position: 'absolute',
        top: '25%', // Ajuste fino para centrarlo visualmente en el escudo
    }
});