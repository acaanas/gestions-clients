-- executer après avoir créer une base de données vide nommée 'gestionclients'


-- phpMyAdmin SQL Dump
-- version 4.6.4
-- https://www.phpmyadmin.net/
--
-- Client :  127.0.0.1
-- Généré le :  Mer 14 Décembre 2016 à 00:36
-- Version du serveur :  5.7.14
-- Version de PHP :  5.6.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données :  `gestionclients`
--

-- --------------------------------------------------------

--
-- Structure de la table `agent`
--

CREATE TABLE `agent` (
  `id` int(11) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `prenom` varchar(50) NOT NULL,
  `login` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Contenu de la table `agent`
--

INSERT INTO `agent` (`id`, `nom`, `prenom`, `login`, `password`) VALUES
(2, 'aca', 'anas', 'acaanas', 'acaanas'),
(3, 'voyage', 'menara', 'menara', 'menara');

-- --------------------------------------------------------

--
-- Structure de la table `client`
--

CREATE TABLE `client` (
  `id` int(11) NOT NULL,
  `telephone` int(11) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `prenom` varchar(50) NOT NULL,
  `mail` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `demande`
--

CREATE TABLE `demande` (
  `id` int(11) NOT NULL,
  `datedemande` varchar(50) NOT NULL,
  `type` varchar(50) NOT NULL,
  `demande` varchar(80) NOT NULL,
  `agentid` int(11) NOT NULL,
  `clientid` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


--
-- Index pour les tables exportées
--

--
-- Index pour la table `agent`
--
ALTER TABLE `agent`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `client`
--
ALTER TABLE `client`
  ADD PRIMARY KEY (`telephone`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Index pour la table `demande`
--
ALTER TABLE `demande`
  ADD PRIMARY KEY (`id`),
  ADD KEY `agentid` (`agentid`,`clientid`),
  ADD KEY `clientid` (`clientid`);

--
-- AUTO_INCREMENT pour les tables exportées
--

--
-- AUTO_INCREMENT pour la table `agent`
--
ALTER TABLE `agent`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
--
-- AUTO_INCREMENT pour la table `client`
--
ALTER TABLE `client`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
--
-- AUTO_INCREMENT pour la table `demande`
--
ALTER TABLE `demande`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
--
-- Contraintes pour les tables exportées
--

--
-- Contraintes pour la table `demande`
--
ALTER TABLE `demande`
  ADD CONSTRAINT `demande_ibfk_1` FOREIGN KEY (`clientid`) REFERENCES `client` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `demande_ibfk_2` FOREIGN KEY (`agentid`) REFERENCES `agent` (`id`) ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
