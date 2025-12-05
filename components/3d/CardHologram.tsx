'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Text } from '@react-three/drei'
import * as THREE from 'three'
import { maskCardNumber } from '@/lib/utils'

interface CardHologramProps {
  cardNumber: string
  holderName: string
  expiryDate: string
}

export function CardHologram({
  cardNumber,
  holderName,
  expiryDate,
}: CardHologramProps) {
  const cardRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (cardRef.current) {
      cardRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
      cardRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Card body */}
      <RoundedBox
        ref={cardRef}
        args={[3.5, 2.2, 0.1]}
        radius={0.1}
        smoothness={4}
      >
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.9}
          roughness={0.1}
          emissive="#00ff88"
          emissiveIntensity={0.2}
        />
      </RoundedBox>

      {/* Card number */}
      <Text
        position={[0, 0.3, 0.06]}
        fontSize={0.25}
        color="#00ff88"
        anchorX="center"
        anchorY="middle"
        font="/fonts/monospace.woff"
      >
        {maskCardNumber(cardNumber)}
      </Text>

      {/* Holder name */}
      <Text
        position={[-1.2, -0.5, 0.06]}
        fontSize={0.18}
        color="#ffffff"
        anchorX="left"
        anchorY="middle"
      >
        {holderName.toUpperCase()}
      </Text>

      {/* Expiry date */}
      <Text
        position={[1.2, -0.5, 0.06]}
        fontSize={0.18}
        color="#ffffff"
        anchorX="right"
        anchorY="middle"
      >
        {expiryDate}
      </Text>

      {/* QuocBank logo */}
      <Text
        position={[-1.2, 0.8, 0.06]}
        fontSize={0.2}
        color="#00ff88"
        anchorX="left"
        anchorY="middle"
        font="/fonts/monospace.woff"
      >
        QUOCBANK
      </Text>

      {/* Chip simulation */}
      <RoundedBox args={[0.4, 0.3, 0.05]} radius={0.02} position={[-0.8, 0.3, 0.06]}>
        <meshStandardMaterial
          color="#ffd700"
          metalness={1}
          roughness={0.2}
        />
      </RoundedBox>
    </group>
  )
}
